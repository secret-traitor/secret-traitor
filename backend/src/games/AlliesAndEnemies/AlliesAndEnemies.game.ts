import groupBy from 'lodash/groupBy'
import merge from 'lodash/merge'
import remove from 'lodash/remove'
import shuffle from 'lodash/shuffle'
import uniqBy from 'lodash/uniqBy'

import {
    AlliesAndEnemiesState,
    Card,
    CardSuit,
    PlayerRole,
    PlayerState,
    PlayerVote,
    TurnState,
    TurnStatus,
    ViewingPlayerState,
    VoteValue,
} from '@games/AlliesAndEnemies/index'
import { IPlayer, PlayerId } from '@entities/Player'
import { GameId } from '@entities/Game'
import { DescriptiveError } from '@shared/api'
import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'

const FirstHandDiscardRecord: Record<
    0 | 1 | 2,
    (cards: [Card, Card, Card]) => [secondHand: [Card, Card], discard: Card]
> = {
    0: (cards) => [[cards[1], cards[2]], cards[0]],
    1: (cards) => [[cards[0], cards[2]], cards[1]],
    2: (cards) => [[cards[0], cards[1]], cards[2]],
}

const SecondHandDiscardRecord: Record<
    0 | 1,
    (cards: [Card, Card]) => [play: Card, discard: Card]
> = {
    0: (cards) => [cards[1], cards[0]],
    1: (cards) => [cards[0], cards[1]],
}

export class ActiveAlliesAndEnemiesState {
    constructor(private state: AlliesAndEnemiesState) {}

    public async saveTo(dao: IAlliesAndEnemiesDao) {
        await dao.put(this.state)
    }

    players(viewingPlayer: IPlayer): ViewingPlayerState[] {
        const playerState = this.state.players.find(
            (p) => p.id === viewingPlayer.id
        )
        if (!playerState) {
            return []
        }
        if (
            playerState.role === PlayerRole.Ally ||
            (playerState.role === PlayerRole.EnemyLeader &&
                this.state.config.leaderIsSecret)
        ) {
            return this.state.players.map((p) =>
                p.id === playerState.id ? p : { ...p, role: undefined }
            )
        }
        return this.state.players
    }

    get gameId(): GameId {
        return this.state.gameId
    }

    private updateState(
        update: Readonly<Partial<AlliesAndEnemiesState>>
    ): AlliesAndEnemiesState {
        this.state = merge(this.state, update) as AlliesAndEnemiesState
        return this.state
    }

    get currentRound(): TurnState {
        return this.state.rounds[this.state.rounds.length - 1]
    }

    private updateCurrentRound(
        update: Readonly<Partial<TurnState>>
    ): AlliesAndEnemiesState {
        const rounds = [...this.state.rounds]
        rounds.pop()
        const updated = merge(this.currentRound, update)
        return this.updateState({ rounds: [...rounds, updated] })
    }

    viewingPlayer(viewingPlayer: IPlayer): ViewingPlayerState {
        return this.players(viewingPlayer).find(
            (p) => p.id === viewingPlayer.id
        ) as ViewingPlayerState
    }

    currentPlayer(viewingPlayer: IPlayer): ViewingPlayerState {
        const position = this.currentRound.position
        return this.players(viewingPlayer).find(
            (p) => p.id === this.currentPlayerId()
        ) as ViewingPlayerState
    }

    private currentPlayerId(): PlayerId {
        const position = this.currentRound.position
        return (this.state.players.find(
            (p) => p.position === position
        ) as PlayerState).id
    }

    ineligibleNominations(viewingPlayer: IPlayer): ViewingPlayerState[] {
        const ineligible = this.ineligiblePlayerIds()
        return this.players(viewingPlayer).filter((p) =>
            ineligible.includes(p.id)
        )
    }

    private ineligiblePlayerIds(): PlayerId[] {
        const previousElections = this.state.rounds
            .sort((r) => r.number)
            .filter((r) => r.elected)
        const players = [this.currentPlayerId()]
        if (previousElections.length > 0) {
            const last = previousElections[previousElections.length - 1]
            const president = this.state.players.find(
                (p) => p.position === last.position
            ) as ViewingPlayerState
            const governor = this.state.players.find(
                (p) => p.id === last.nomination
            ) as ViewingPlayerState
            players.push(president.id, governor.id)
        }
        return players
    }

    private checkCards(): boolean {
        // const allyCards = this.state.board.ally.cards.length
        // const enemyCards = this.state.board.enemy.cards.length
        const drawCards = this.state.draw.length
        const discardCards = this.state.discard.length
        // const cardCount = allyCards + enemyCards + drawCards + discardCards

        const deckCheck = drawCards + discardCards >= 3

        // console.log()
        // logger.debug(
        //     'Card check : ' +
        //         JSON.stringify({
        //             deckCheck,
        //             cardCountCheck,
        //         })
        // )

        return deckCheck
    }

    private shuffleDiscard() {
        this.updateState({
            draw: shuffle(this.state.discard),
            discard: [],
        })
    }

    private drawCard(): Card {
        if (!this.checkCards()) {
            throw new Error('the game is in an invalid state!')
        }
        if (this.state.draw.length === 0) {
            this.shuffleDiscard()
            return this.drawCard()
        }
        return this.state.draw.pop() as Card
    }

    private playCard(card: Required<Card>) {
        if (card.suit === CardSuit.Ally) {
            this.state.board.ally.cards.push(card)
            if (
                this.state.board.ally.cards.length ===
                this.state.board.ally.maxCards
            ) {
                // ally win
            }
        }
        if (card.suit === CardSuit.Enemy) {
            this.state.board.enemy.cards.push(card)
            if (
                this.state.board.enemy.cards.length ===
                this.state.board.enemy.maxCards
            ) {
                // enemy win
            }
        }
    }

    private votePass = () => {
        this.updateCurrentRound({
            status: TurnStatus.FirstHand,
            elected: true,
            firstHand: [this.drawCard(), this.drawCard(), this.drawCard()],
        })
    }

    private voteFail = () => {
        const currentRound = this.currentRound
        let consecutiveFailedElections =
            currentRound.consecutiveFailedElections + 1
        if (consecutiveFailedElections >= 3) {
            consecutiveFailedElections = 0
            this.playCard(this.drawCard())
        }
        this.updateCurrentRound({
            consecutiveFailedElections,
            elected: false,
        })
        this.advanceRound()
    }

    private advanceRound = () => {
        const currentRound = this.currentRound
        let nextPosition = currentRound.position + 1
        if (nextPosition >= this.state.players.length) {
            nextPosition = 0
        }
        const newRound = {
            consecutiveFailedElections: 0,
            elected: false,
            number: currentRound.number + 1,
            position: nextPosition,
            status: TurnStatus.Nomination,
            vetoIsEnabled: nextPosition >= this.state.config.enableVeto,
            votes: [],
        }
        this.updateState({ rounds: [...this.state.rounds, newRound] })
    }

    public nominate(
        nominatedPlayerId: PlayerId
    ): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.Nomination) {
            return [
                false,
                new DescriptiveError(
                    'Unable to nominate a player.',
                    'The turn state does not allow this action.',
                    'Are you supposed to be nominating a player?'
                ),
            ]
        }
        const nominatedPlayer = this.state.players.find(
            (p) => p.id === nominatedPlayerId
        )
        if (!nominatedPlayer) {
            return [
                false,
                new DescriptiveError(
                    'Unable to nominate a player.',
                    'No player with this id found.',
                    'Check that a player exists before nominating them.'
                ),
            ]
        }
        if (this.ineligiblePlayerIds().includes(nominatedPlayer.id)) {
            return [
                false,
                new DescriptiveError(
                    'Unable to nominate a player.',
                    'This player is ineligible.',
                    'Please refresh the page before making another nomination.'
                ),
            ]
        }
        this.updateCurrentRound({
            nomination: nominatedPlayer.id,
            status: TurnStatus.Election,
        })
        return [true]
    }

    public vote(
        playerId: string,
        vote: VoteValue
    ): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.Election) {
            return [
                false,
                new DescriptiveError(
                    'Unable to play first hand.',
                    'The turn state does not allow this action.',
                    'Are you supposed to be playing the first hand?'
                ),
            ]
        }
        const votes = uniqBy(
            this.currentRound.votes as PlayerVote[],
            (v) => v.playerId
        )
        remove(votes, (v) => v.playerId === playerId)
        this.updateCurrentRound({ votes: [...votes, { playerId, vote }] })
        if (this.currentRound.votes.length >= this.state.players.length) {
            const groupedVotes = groupBy(
                this.currentRound.votes,
                (v) => v.vote
            ) as Record<VoteValue, PlayerVote[]>
            const yesVotes = groupedVotes[VoteValue.Yes]?.length ?? 0
            const noVotes = groupedVotes[VoteValue.No]?.length ?? 0
            if (yesVotes > noVotes) {
                this.votePass()
            } else {
                this.voteFail()
            }
        }
        return [true]
    }

    public firstHand(
        discardIndex: 0 | 1 | 2
    ): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.FirstHand) {
            return [
                false,
                new DescriptiveError(
                    'Unable to play first hand.',
                    'The turn state does not allow this action.',
                    'Are you supposed to be playing the first hand?'
                ),
            ]
        }
        if (!this.currentRound.firstHand) {
            return [
                false,
                new DescriptiveError(
                    'Unable to play first hand.',
                    'No cards have been drawn.',
                    'Are you supposed to be playing the first hand?'
                ),
            ]
        }
        const [secondHand, discard] = FirstHandDiscardRecord[discardIndex](
            this.currentRound.firstHand
        )
        this.updateCurrentRound({
            secondHand,
            status: TurnStatus.SecondHand,
        })
        this.updateState({ discard: [...this.state.discard, discard] })
        return [true]
    }

    public secondHand(
        discardIndex: 0 | 1
    ): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.SecondHand) {
            return [
                false,
                new DescriptiveError(
                    'Unable to play second hand.',
                    'The turn state does not allow this action.',
                    'Are you supposed to be playing the second hand?'
                ),
            ]
        }
        if (!this.currentRound.secondHand) {
            return [
                false,
                new DescriptiveError(
                    'Unable to play first hand.',
                    'No cards have been drawn.',
                    'Are you supposed to be playing the first hand?'
                ),
            ]
        }
        const [play, discard] = SecondHandDiscardRecord[discardIndex](
            this.currentRound.secondHand
        )
        this.updateCurrentRound({
            status: TurnStatus.TakeAction,
        })
        this.playCard(play)
        this.updateState({ discard: [...this.state.discard, discard] })
        return [true]
    }
}

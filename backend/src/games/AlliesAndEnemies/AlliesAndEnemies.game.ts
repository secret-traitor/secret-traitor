import groupBy from 'lodash/groupBy'
import merge from 'lodash/merge'
import remove from 'lodash/remove'
import shuffle from 'lodash/shuffle'
import uniqBy from 'lodash/uniqBy'

import {
    AlliesAndEnemiesState,
    BoardAction,
    BoardState,
    Card,
    Faction,
    PlayerRole,
    PlayerState,
    PlayerStatus,
    PlayerVote,
    TurnState,
    TurnStatus,
    Victory,
    VictoryType,
    ViewingPlayerState,
    VoteValue,
} from '@games/AlliesAndEnemies/index'
import { IPlayer, PlayerId } from '@entities/Player'
import { GameId } from '@entities/Game'
import { DescriptiveError } from '@shared/api'
import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies'

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

function getPlayerState(player: PlayerState, currentRound: TurnState) {
    let status = PlayerStatus.None
    if (currentRound.elected) {
        if (currentRound.position === player.position) {
            status = PlayerStatus.President
        }
        if (currentRound.nomination === player.id) {
            status = PlayerStatus.Governor
        }
    }
    if (player.hasBeenExecuted) {
        status = PlayerStatus.Executed
    }
    return status
}

export class ActiveAlliesAndEnemiesState {
    constructor(private state: AlliesAndEnemiesState) {}

    public async saveTo(dao: IAlliesAndEnemiesDao) {
        await dao.put(this.state)
    }

    public players(viewingPlayer: IPlayer): ViewingPlayerState[] {
        const playerState = this.state.players.find(
            (p) => p.id === viewingPlayer.id
        )
        if (!playerState) {
            return []
        }
        const hideEnemyLeader =
            playerState.role === PlayerRole.EnemyLeader &&
            this.state.config.leaderIsSecret
        const hideRole =
            !this.state.victory &&
            (playerState.role === PlayerRole.Ally || hideEnemyLeader)
        return this.state.players.map((p) => {
            const role =
                p.id === playerState.id || !hideRole ? p.role : undefined
            return {
                ...p,
                role,
                status: getPlayerState(p, this.currentRound),
            }
        })
    }

    get gameId(): GameId {
        return this.state.gameId
    }

    private updateState(update: Readonly<Partial<AlliesAndEnemiesState>>) {
        this.state = merge(this.state, update) as AlliesAndEnemiesState
        return this.state
    }

    get currentRound(): TurnState {
        return this.state.rounds[this.state.rounds.length - 1]
    }

    private updateCurrentRound(update: Readonly<Partial<TurnState>>) {
        const rounds = [...this.state.rounds.sort((r) => r.number)]
        rounds.pop()
        const updated = merge(this.currentRound, update)
        return this.updateState({ rounds: [...rounds, updated] })
    }

    public viewingPlayer(viewingPlayer: IPlayer): ViewingPlayerState {
        return this.players(viewingPlayer).find(
            (p) => p.id === viewingPlayer.id
        ) as ViewingPlayerState
    }

    public currentPlayer(viewingPlayer: IPlayer): ViewingPlayerState {
        return this.players(viewingPlayer).find(
            (p) => p.id === this.currentPlayerId()
        ) as ViewingPlayerState
    }

    private updatePlayer(update: Partial<PlayerState> & { id: PlayerId }) {
        const index = this.state.players.findIndex((p) => p.id === update.id)
        const players = [...this.state.players]
        players[index] = { ...players[index], ...update }
        this.updateState({ players })
    }

    private currentPlayerId(): PlayerId {
        const position = this.currentRound.position
        return (this.state.players.find(
            (p) => p.position === position
        ) as PlayerState).id
    }

    public ineligibleNominations(viewingPlayer: IPlayer): ViewingPlayerState[] {
        const ineligible = this.ineligiblePlayerIds()
        return this.players(viewingPlayer).filter((p) =>
            ineligible.includes(p.id)
        )
    }

    private ineligiblePlayerIds() {
        if (this.state.players.filter((p) => !p.hasBeenExecuted).length < 5) {
            return [this.currentPlayerId()]
        }
        const previousElections = this.state.rounds
            .sort((r) => r.number)
            .filter((r) => r.elected)
        const players = new Set([this.currentPlayerId()])
        if (previousElections.length > 0) {
            const last = previousElections[previousElections.length - 1]
            const president = this.state.players.find(
                (p) => p.position === last.position
            ) as ViewingPlayerState
            players.add(president.id)
            const governor = this.state.players.find(
                (p) => p.id === last.nomination
            ) as ViewingPlayerState
            players.add(governor.id)
        }
        this.state.players.forEach((p) => {
            if (p.hasBeenExecuted) {
                players.add(p.id)
            }
        })
        return [...players]
    }

    private checkCards(): boolean {
        const allyCards = this.state.board.ally.length
        const enemyCards = this.state.board.enemy.length
        const cardCount =
            allyCards + enemyCards + this.drawSize + this.discardSize
        const totalCards =
            this.state.config.deck.allyCards + this.state.config.deck.enemyCards

        const cardCountCheck = cardCount >= totalCards - 3
        const deckCheck = this.drawSize + this.discardSize >= 3
        return deckCheck && cardCountCheck
    }

    get drawSize(): number {
        return this.state.draw.length
    }

    get discardSize(): number {
        return this.state.discard.length
    }

    public shuffleDiscard() {
        this.updateState({
            draw: [...this.state.draw, ...shuffle(this.state.discard)],
            discard: [],
        })
        this.checkCards()
    }

    get board(): BoardState {
        return {
            enemy: [...this.state.board.enemy],
            ally: [...this.state.board.ally],
        } as BoardState
    }

    private drawCard(): Card {
        if (!this.checkCards()) {
            throw new Error('the game is in an invalid state!')
        }
        if (this.state.draw.length === 0) {
            this.shuffleDiscard()
            return this.drawCard()
        }
        return this.state.draw.shift() as Card
    }

    private playCard(card: Required<Card>) {
        this.pushCard(card)
        if (card.suit === Faction.Enemy) {
            const actionIndex = this.state.board.enemy.length - 1
            const action =
                this.state.config.actions[actionIndex] || BoardAction.None
            if (action !== BoardAction.None) {
                this.updateCurrentRound({
                    status: TurnStatus.TakeAction,
                    action,
                })
                return action
            }
        }
        this.advanceRound()
        return
    }

    private pushCard(card: Required<Card>) {
        switch (card.suit) {
            case Faction.Enemy:
                this.state.board.enemy.push(card)
                if (
                    this.state.board.enemy.length ===
                    this.state.config.victory.enemyCards
                ) {
                    this.enemyVictory(
                        VictoryType.Cards,
                        `The enemies have passed ${this.state.board.enemy.length} policies.`
                    )
                }
                return
            case Faction.Ally:
                this.state.board.ally.push(card)
                if (
                    this.state.board.ally.length ===
                    this.state.config.victory.allyCards
                ) {
                    this.allyVictory(
                        VictoryType.Cards,
                        `The allies have passed ${this.state.board.ally.length} policies.`
                    )
                }
                return
        }
    }

    private advanceRound() {
        const nextRoundNumber = this.currentRound.number + 1
        const nextPosition = this.getNextPosition()
        const newRound = {
            consecutiveFailedElections: 0,
            elected: false,
            enableVeto: this.checkVeto,
            number: nextRoundNumber,
            position: nextPosition,
            status: TurnStatus.Nomination,
            votes: [],
        }
        this.updateState({ rounds: [...this.state.rounds, newRound] })
    }

    private getNextPosition() {
        const players = this.state.players.sort((p) => p.position)
        const positions = [
            ...Array(this.state.players.length).keys(),
            ...Array(this.state.players.length).keys(),
        ]
        let cursor = this.currentRound.position + 1
        if (this.currentRound.specialElection) {
            const lastRoundIndex = this.state.rounds.findIndex(
                (r) => !r.specialElection
            )
            cursor = this.state.rounds[lastRoundIndex].position + 1
        }
        while (players[positions[cursor]].hasBeenExecuted) {
            cursor++
        }
        return positions[cursor]
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
                    'Unable to nominate this player.',
                    'Player with this id does not exist.',
                    'Check that a player exists before nominating them.'
                ),
            ]
        }
        if (nominatedPlayer.hasBeenExecuted) {
            return [
                false,
                new DescriptiveError(
                    'Unable to nominate this player.',
                    'This player has been executed.',
                    'Please refresh the page before trying again.'
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
                    'Unable to vote.',
                    'The turn state does not allow this action.',
                    'Are you supposed to be voting right now?'
                ),
            ]
        }
        const votingPlayer = this.state.players.find((p) => p.id === playerId)
        if (!votingPlayer) {
            return [
                false,
                new DescriptiveError(
                    'Unable to vote.',
                    'A player with this id does not exist.',
                    'Are you supposed to be voting right now?'
                ),
            ]
        }
        if (votingPlayer.hasBeenExecuted) {
            return [
                false,
                new DescriptiveError(
                    'Unable to vote.',
                    'Executed players can not vote.',
                    'Are you supposed to be voting right now?'
                ),
            ]
        }
        const votes = uniqBy(
            this.currentRound.votes as PlayerVote[],
            (v) => v.playerId
        )
        remove(votes, (v) => v.playerId === playerId)
        this.updateCurrentRound({ votes: [...votes, { playerId, vote }] })
        this.checkElectionResults()
        return [true]
    }

    public checkElectionResults(): [completed: boolean, success?: boolean] {
        const neededVotes = this.state.players.filter((p) => !p.hasBeenExecuted)
            .length
        console.log({ neededVotes, count: this.currentRound.votes.length })
        if (this.currentRound.votes.length >= neededVotes) {
            const groupedVotes = groupBy(
                this.currentRound.votes,
                (v) => v.vote
            ) as Record<VoteValue, PlayerVote[]>
            const yesVotes = groupedVotes[VoteValue.Yes]?.length ?? 0
            const noVotes = groupedVotes[VoteValue.No]?.length ?? 0
            if (yesVotes > noVotes) {
                this.votePass()
                return [true, true]
            } else {
                this.voteFail()
                return [true, false]
            }
        }
        return [false]
    }

    private votePass() {
        const nominatedPlayer = this.state.players.find(
            (p) => p.id === this.currentRound.nomination
        ) as PlayerState
        if (
            this.state.board.enemy.length >=
                this.state.config.victory.election &&
            nominatedPlayer.role === PlayerRole.EnemyLeader
        ) {
            this.enemyVictory(
                VictoryType.Election,
                `${nominatedPlayer.nickname} has been elected. ${nominatedPlayer.nickname} is the enemy leader!`
            )
        }
        this.updateCurrentRound({
            status: TurnStatus.FirstHand,
            elected: true,
            firstHand: [this.drawCard(), this.drawCard(), this.drawCard()],
        })
    }

    private voteFail() {
        const currentRound = this.currentRound
        let consecutiveFailedElections =
            currentRound.consecutiveFailedElections + 1
        if (consecutiveFailedElections >= 3) {
            consecutiveFailedElections = 0
            this.pushCard(this.drawCard())
        }
        this.updateCurrentRound({
            consecutiveFailedElections,
            elected: false,
        })
        this.advanceRound()
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
                    'Are you supposed to be playing the second hand?'
                ),
            ]
        }
        const [play, discard] = SecondHandDiscardRecord[discardIndex](
            this.currentRound.secondHand
        )
        this.playCard(play)
        this.updateState({ discard: [...this.state.discard, discard] })
        return [true]
    }

    private allyVictory(type: VictoryType, message?: string) {
        this.updateState({
            victory: {
                type,
                team: Faction.Ally,
                message: message ?? 'Allies have won!',
            },
        })
        this.updateCurrentRound({
            status: TurnStatus.GameOver,
        })
    }

    private enemyVictory(type: VictoryType, message?: string) {
        this.updateState({
            victory: {
                type,
                team: Faction.Enemy,
                message: message ?? 'Enemies have won!',
            },
        })
        this.updateCurrentRound({
            status: TurnStatus.GameOver,
        })
    }

    get victory(): Victory | null {
        return this.state.victory ?? null
    }

    public policyPeek(): [
        cards?: [Card, Card, Card],
        error?: DescriptiveError
    ] {
        if (this.currentRound.status !== TurnStatus.TakeAction) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to take the policy peek action.',
                    'The turn state does not allow taking board actions',
                    'Are you supposed to be taking an action?'
                ),
            ]
        }
        if (this.currentRound.action !== BoardAction.PolicyPeek) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to take the policy peek action.',
                    'The action for the current turn is not policy peek.',
                    'Please check the appropriate action before attempting an action.'
                ),
            ]
        }
        if (this.state.draw.length < 3) {
            this.shuffleDiscard()
        }
        const cards = [
            this.state.draw[0],
            this.state.draw[1],
            this.state.draw[2],
        ] as [Card, Card, Card]
        return [cards]
    }

    public policyPeekOk(): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.TakeAction) {
            return [
                false,
                new DescriptiveError(
                    'Unable to take the policy peek action.',
                    'The turn state does not allow taking board actions',
                    'Are you supposed to be taking an action?'
                ),
            ]
        }
        if (this.currentRound.action !== BoardAction.PolicyPeek) {
            return [
                false,
                new DescriptiveError(
                    'Unable to take the policy peek action.',
                    'The action for the current turn is not policy peek.',
                    'Please check the appropriate action before attempting an action.'
                ),
            ]
        }
        this.advanceRound()
        return [true]
    }

    public specialElection(
        playerId: PlayerId
    ): [nominatedPlayerId?: PlayerId, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.TakeAction) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to take the special election action.',
                    'The turn state does not allow taking board actions',
                    'Are you supposed to be taking an action?'
                ),
            ]
        }
        if (this.currentRound.action !== BoardAction.SpecialElection) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to take the special election action.',
                    'The action for the current turn is not special election.',
                    'Please check the appropriate action before attempting an action.'
                ),
            ]
        }
        const specialElectedPlayer = this.state.players.find(
            (p) => p.id === playerId
        )
        if (!specialElectedPlayer) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to elect this player.',
                    'Player with this id does not exist.',
                    'Please refresh the page before trying again.'
                ),
            ]
        }
        if (specialElectedPlayer.hasBeenExecuted) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to elect this player.',
                    'Can not elect executed players.',
                    'Please refresh the page before trying again.'
                ),
            ]
        }
        this.specialElectionRound(specialElectedPlayer.position)
        return [playerId]
    }

    private specialElectionRound(position: number) {
        this.advanceRound()
        this.updateCurrentRound({
            specialElection: true,
            position,
        })
    }

    public executePlayer(
        playerId: PlayerId
    ): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.TakeAction) {
            return [
                false,
                new DescriptiveError(
                    'Unable to take the execute action.',
                    'The turn state does not allow taking board actions',
                    'Are you supposed to be taking an action?'
                ),
            ]
        }
        if (this.currentRound.action !== BoardAction.Execution) {
            return [
                false,
                new DescriptiveError(
                    'Unable to take the execute action.',
                    'The action for the current turn is not execute.',
                    'Please check the appropriate action before attempting an action.'
                ),
            ]
        }
        const executedPlayer = this.state.players.find((p) => p.id === playerId)
        if (!executedPlayer) {
            return [
                false,
                new DescriptiveError(
                    'Unable to take the execute action.',
                    'Player with this id does not exist.',
                    'Please refresh the page before trying again.'
                ),
            ]
        }
        if (executedPlayer.hasBeenExecuted) {
            return [
                false,
                new DescriptiveError(
                    'Unable to take the execute action.',
                    'This player has already been executed.',
                    'Please refresh the page before trying again.'
                ),
            ]
        }
        this.updatePlayer({ id: playerId, hasBeenExecuted: true })
        if (executedPlayer.role === PlayerRole.EnemyLeader) {
            this.allyVictory(
                VictoryType.Execution,
                `${executedPlayer.nickname} has been executed. ${executedPlayer.nickname} is the enemy leader!`
            )
        }
        this.advanceRound()
        return [true]
    }

    get checkVeto() {
        console.log({
            enemy: this.state.board.enemy.length,
            enable: this.state.config.enableVeto,
        })
        return this.state.board.enemy.length >= this.state.config.enableVeto
    }

    public callVeto(): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.SecondHand) {
            return [
                false,
                new DescriptiveError(
                    'Unable to veto.',
                    'Vetoes must occur during the second hand.',
                    'Please refresh the page before trying again.'
                ),
            ]
        }
        if (!this.currentRound.enableVeto) {
            return [
                false,
                new DescriptiveError(
                    'Unable to veto.',
                    'Veto is not enabled for this round.',
                    'Please refresh the screen before trying again.'
                ),
            ]
        }
        if (this.checkVeto) {
            return [
                false,
                new DescriptiveError(
                    'Unable to veto.',
                    'Not enough enemy cards have been played to allow veto.',
                    'Please refresh the screen before trying again.'
                ),
            ]
        }
        if (!this.currentRound.secondHand) {
            return [
                false,
                new DescriptiveError(
                    'Unable to veto.',
                    'No cards have been drawn.',
                    'Are you supposed to be playing the first hand?'
                ),
            ]
        }
        this.updateCurrentRound({
            status: TurnStatus.Veto,
        })
        return [true]
    }

    public vetoVote(
        vote: VoteValue
    ): [success: boolean, error?: DescriptiveError] {
        if (vote === VoteValue.Yes) {
            if (!this.currentRound.secondHand) {
                return [
                    false,
                    new DescriptiveError(
                        'Unable to vote on this veto.',
                        'The second hand is in an invalid state.',
                        'Are you supposed to be playing the first hand?'
                    ),
                ]
            }
            this.updateState({
                discard: [
                    ...this.state.discard,
                    this.currentRound.secondHand[0] as Card,
                    this.currentRound.secondHand[1] as Card,
                ],
            })
            this.updateCurrentRound({
                status: TurnStatus.FirstHand,
                firstHand: [this.drawCard(), this.drawCard(), this.drawCard()],
                secondHand: undefined,
            })
            return [true]
        }
        this.updateCurrentRound({
            status: TurnStatus.SecondHand,
            enableVeto: false,
        })
        return [true]
    }

    public investigateLoyalty(
        playerId: PlayerId
    ): [faction?: Faction, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.TakeAction) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to take the execute action.',
                    'The turn state does not allow taking board actions',
                    'Are you supposed to be taking an action?'
                ),
            ]
        }
        if (this.currentRound.action !== BoardAction.InvestigateLoyalty) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to investigate loyalty.',
                    'The action for the current turn is not investigate loyalty.',
                    'Please check the appropriate action before attempting an action.'
                ),
            ]
        }
        const investigatedPlayer = this.state.players.find(
            (p) => p.id === playerId
        )
        if (!investigatedPlayer) {
            return [
                undefined,
                new DescriptiveError(
                    'Unable to investigate loyalty.',
                    'Player with this id does not exist.',
                    'Please refresh the page before trying again.'
                ),
            ]
        }
        return [
            investigatedPlayer.role === PlayerRole.Ally
                ? Faction.Ally
                : Faction.Enemy,
        ]
    }

    investigateLoyaltyOk(): [success: boolean, error?: DescriptiveError] {
        if (this.currentRound.status !== TurnStatus.TakeAction) {
            return [
                false,
                new DescriptiveError(
                    'Unable to take the execute action.',
                    'The turn state does not allow taking board actions',
                    'Are you supposed to be taking an action?'
                ),
            ]
        }
        if (this.currentRound.action !== BoardAction.InvestigateLoyalty) {
            return [
                false,
                new DescriptiveError(
                    'Unable to investigate loyalty.',
                    'The action for the current turn is not investigate loyalty.',
                    'Please check the appropriate action before attempting an action.'
                ),
            ]
        }
        this.advanceRound()
        return [true]
    }
}

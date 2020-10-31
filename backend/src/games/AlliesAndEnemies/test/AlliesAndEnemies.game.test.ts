import merge from 'lodash/merge'

import {
    ActiveAlliesAndEnemiesState,
    AlliesAndEnemiesState,
    BoardAction,
    BoardState,
    buildDeck,
    Card,
    ConfigurationOptions,
    Faction,
    PlayerState,
    PlayerVote,
    StandardConfiguration,
    TurnState,
    TurnStatus,
    VictoryType,
    VoteValue,
} from '@games/AlliesAndEnemies'
import { buildPlayers } from '@games/AlliesAndEnemies/test/helpers'

export const firstRound = () => ({
    consecutiveFailedElections: 0,
    number: 1,
    position: 0,
    status: TurnStatus.Nomination,
    votes: [],
})

export const defaultState = (
    config: ConfigurationOptions = StandardConfiguration[5]
) => ({
    board: { ally: [], enemy: [] },
    config,
    discard: [],
    draw: [],
    gameId: 'GAME_ID',
    players: buildPlayers(5, 0, 0),
    rounds: [],
})

const viewingPlayer = Object.freeze({ id: '0', nickname: '0' })
const card = (suit: Faction) => ({ suit } as Card)
const cards = (suit: Faction, n: number) => Array(n).fill({ suit }) as Card[]
describe('Allies and Enemies', () => {
    describe('game active state management', () => {
        it('plays out a game with all enemy cards', () => {
            function passVote() {
                state.vote('0', VoteValue.Yes)
                state.vote('1', VoteValue.Yes)
                state.vote('2', VoteValue.Yes)
                state.vote('3', VoteValue.Yes)
                state.vote('4', VoteValue.Yes)
            }
            const state = new ActiveAlliesAndEnemiesState(
                merge(defaultState(StandardConfiguration[5]), {
                    draw: buildDeck(0, 17),
                    rounds: [firstRound()],
                })
            )
            let turnNumber = 1
            // ---- turn 1 ----
            expect(state.currentRound.number).toBe(turnNumber++)
            expect(state.currentRound.status).toBe(TurnStatus.Nomination)
            state.nominate('1')
            expect(state.currentRound.nomination).toBe('1')
            state.vote('0', VoteValue.Yes)
            state.vote('1', VoteValue.Yes)
            state.vote('2', VoteValue.Yes)
            state.vote('3', VoteValue.Yes)
            expect(state.currentRound.votes.length).toBe(4)
            state.vote('4', VoteValue.Yes)
            expect(state.currentRound.status).toBe(TurnStatus.FirstHand)
            state.firstHand(1)
            expect(state.currentRound.status).toBe(TurnStatus.SecondHand)
            expect(state.discardSize).toBe(1)
            state.secondHand(1)
            expect(state.discardSize).toBe(2)
            // ---- turn 2 ----
            expect(state.currentRound.number).toBe(turnNumber++)
            state.nominate('2')
            passVote()
            state.firstHand(0)
            state.secondHand(0)
            // ---- turn 3 ----
            expect(state.currentRound.number).toBe(turnNumber++)
            state.nominate('3')
            passVote()
            state.firstHand(0)
            state.secondHand(0)
            expect(state.currentRound.status).toBe(TurnStatus.TakeAction)
            expect(state.currentRound.action).toBe(BoardAction.PolicyPeek)
            state.policyPeek()
            state.policyPeekOk()
            // ---- turn 4 ----
            expect(state.currentRound.number).toBe(turnNumber++)
            state.nominate('4')
            passVote()
            state.firstHand(0)
            state.secondHand(0)
            expect(state.currentRound.status).toBe(TurnStatus.TakeAction)
            expect(state.currentRound.action).toBe(BoardAction.Execution)
            state.executePlayer('0')
            expect(
                (state
                    .players(viewingPlayer)
                    .find((p) => p.id === '0') as PlayerState)?.hasBeenExecuted
            ).toBe(true)
            // ---- turn 5 ----
            expect(state.currentRound.number).toBe(turnNumber++)
            state.nominate('1')
            passVote()
            state.firstHand(0)
            state.secondHand(0)
            expect(state.currentRound.status).toBe(TurnStatus.TakeAction)
            expect(state.currentRound.action).toBe(BoardAction.Execution)
            expect(state.currentPlayer(viewingPlayer).position).toBe(4)
            state.executePlayer('1')
            expect(state.currentPlayer(viewingPlayer).position).toBe(2)
            // ---- turn 6 ----
            expect(state.currentRound.number).toBe(turnNumber++)
            state.nominate('3')
            passVote()
            state.firstHand(0)
            expect(state.victory).toBeNull()
            state.secondHand(0)
            expect(state.victory).not.toBeNull()
            expect(state.victory?.team).toBe(Faction.Enemy)
            expect(state.victory?.type).toBe(VictoryType.Cards)
        })
    })

    describe('nomination', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    draw: buildDeck(0, 17),
                },
                state
            )
        it('does not allow action turn state is not take action', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [{ position: 0 } as TurnState],
                })
            )
            const [ok, error] = state.nominate('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/does not allow/i)
        })
        it('does not nominate invalid players', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.Nomination,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.nominate('11111')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/does not exist/i)
        })
        it('does not nominate executed players', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    players: [
                        {
                            hasBeenExecuted: true,
                        } as PlayerState,
                    ],
                    rounds: [
                        {
                            position: 1,
                            status: TurnStatus.Nomination,
                        } as TurnState,
                    ],
                })
            )
            const [nominated, error] = state.nominate('0')
            expect(nominated).toBe(false)
            expect(error?.toString()).toMatch(/executed/i)
        })
        it('does not nominate ineligible players', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            nomination: '2',
                            elected: true,
                        } as TurnState,
                        {
                            position: 0,
                            status: TurnStatus.Nomination,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.nominate('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/ineligible/i)
        })
        it('nominates eligible players', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.Nomination,
                        } as TurnState,
                    ],
                })
            )
            const [ok] = state.nominate('3')
            expect(ok).toBe(true)
        })
    })

    describe('voting', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    draw: buildDeck(0, 17),
                },
                state
            )
        it('does not allow voting when status is not election', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({ rounds: [{ position: 0 } as TurnState] })
            )
            const [ok, error] = state.vote('0', VoteValue.Yes)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/turn state does not allow/i)
        })
        it('does not vote for an invalid player', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.Election,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.vote('11111', VoteValue.Yes)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/does not exist/i)
        })
        it('does not vote for executed players', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    players: [
                        {
                            hasBeenExecuted: true,
                        } as PlayerState,
                    ],
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.Election,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.vote('0', VoteValue.Yes)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/executed/i)
        })
        it('does not require votes from executed players', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    players: [
                        {
                            hasBeenExecuted: true,
                        } as PlayerState,
                    ],
                    rounds: [
                        {
                            number: 1,
                            position: 0,
                            status: TurnStatus.Election,
                        } as TurnState,
                    ],
                })
            )
            state.vote('1', VoteValue.No)
            state.vote('2', VoteValue.No)
            state.vote('3', VoteValue.No)
            state.vote('4', VoteValue.No)
            expect(state.currentRound.number).toBe(2)
        })
    })

    describe('election', () => {
        const vote = (playerId: string, vote: VoteValue) =>
            ({ playerId, vote } as PlayerVote)
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    draw: buildDeck(17, 0),
                },
                state
            )
        it('sets status to FirstHand for successful election', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 1,
                            position: 0,
                            status: TurnStatus.Election,
                            votes: [
                                vote('0', VoteValue.Yes),
                                vote('1', VoteValue.Yes),
                                vote('2', VoteValue.Yes),
                                vote('3', VoteValue.Yes),
                                vote('4', VoteValue.Yes),
                            ],
                        } as TurnState,
                    ],
                })
            )
            const [completed, success] = state.checkElectionResults()
            expect(completed).toBe(true)
            expect(success).toBe(true)
            expect(state.currentRound.status).toBe(TurnStatus.FirstHand)
        })
        it('moves to next round for failed election', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 1,
                            position: 0,
                            status: TurnStatus.Election,
                            votes: [
                                vote('0', VoteValue.No),
                                vote('1', VoteValue.No),
                                vote('2', VoteValue.No),
                                vote('3', VoteValue.No),
                                vote('4', VoteValue.No),
                            ],
                        } as TurnState,
                    ],
                })
            )
            const [completed, success] = state.checkElectionResults()
            expect(completed).toBe(true)
            expect(success).toBe(false)
            expect(state.currentRound.number).toBe(2)
            expect(state.currentRound.status).toBe(TurnStatus.Nomination)
        })
        it('plays the top card of the deck on 3 failed rounds', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 1,
                            position: 0,
                            status: TurnStatus.Election,
                            votes: [
                                vote('0', VoteValue.No),
                                vote('1', VoteValue.No),
                                vote('2', VoteValue.No),
                                vote('3', VoteValue.No),
                                vote('4', VoteValue.No),
                            ],
                        } as TurnState,
                    ],
                })
            )
            const [completed, success] = state.checkElectionResults()
            expect(completed).toBe(true)
            expect(success).toBe(false)
            expect(state.currentRound.number).toBe(2)
            expect(state.currentRound.status).toBe(TurnStatus.Nomination)
        })
        it('sets victory status when enemy leader is elected', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            consecutiveFailedElections: 2,
                            position: 0,
                            status: TurnStatus.Election,
                            votes: [
                                vote('0', VoteValue.No),
                                vote('1', VoteValue.No),
                                vote('2', VoteValue.No),
                                vote('3', VoteValue.No),
                                vote('4', VoteValue.No),
                            ],
                        } as TurnState,
                    ],
                })
            )
            expect(state.drawSize).toBe(17)
            expect(state.currentRound.consecutiveFailedElections).toBe(2)
            const [completed, success] = state.checkElectionResults()
            expect(completed).toBe(true)
            expect(success).toBe(false)
            expect(state.drawSize).toBe(16)
            expect(state.currentRound.consecutiveFailedElections).toBe(0)
        })
    })
    describe('first hand', () => {
        const card = (suit: Faction) => ({ suit } as Card)
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    draw: buildDeck(3, 0),
                },
                state
            )
        it('does not discard when the turn state is not first hand', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({ rounds: [{ position: 0 } as TurnState] })
            )
            const [ok, error] = state.firstHand(0)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/turn state does not allow/i)
        })
        it('provides an error when no cards have been drawn', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.FirstHand,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.firstHand(0)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/No cards have been drawn/i)
        })
        it('puts card in the discard pile', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.FirstHand,
                            firstHand: [
                                card(Faction.Ally),
                                card(Faction.Ally),
                                card(Faction.Ally),
                            ],
                        } as TurnState,
                    ],
                })
            )
            expect(state.discardSize).toBe(0)
            state.firstHand(0)
            expect(state.discardSize).toBe(1)
        })
    })

    describe('second hand', () => {
        const card = (suit: Faction) => ({ suit } as Card)
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    draw: buildDeck(3, 0),
                },
                state
            )
        it('does not discard when the turn state is not second hand', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({ rounds: [{ position: 0 } as TurnState] })
            )
            const [ok, error] = state.secondHand(0)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/turn state does not allow/i)
        })
        it('provides an error when no cards have been drawn', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.SecondHand,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.secondHand(0)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/No cards have been drawn/i)
        })
        it('puts card in the discard pile', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.SecondHand,
                            secondHand: [
                                card(Faction.Ally),
                                card(Faction.Ally),
                            ],
                        } as TurnState,
                    ],
                })
            )
            expect(state.discardSize).toBe(0)
            state.secondHand(0)
            expect(state.discardSize).toBe(1)
        })
    })

    describe('pushing a card', () => {
        const card = (suit: Faction) => ({ suit } as Card)
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    draw: buildDeck(3, 0),
                },
                state
            )
        it('sets victory status to ally when 5 cards are pushed', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.SecondHand,
                            secondHand: [
                                card(Faction.Ally),
                                card(Faction.Ally),
                            ],
                        } as TurnState,
                    ],
                    board: {
                        ally: [
                            card(Faction.Ally),
                            card(Faction.Ally),
                            card(Faction.Ally),
                            card(Faction.Ally),
                        ],
                    } as BoardState,
                })
            )
            expect(state.victory).toBeNull()
            state.secondHand(0)
            expect(state.victory).not.toBeNull()
            expect(state.victory?.type).toBe(VictoryType.Cards)
            expect(state.victory?.team).toBe(Faction.Ally)
        })
        it('sets victory status to enemy when 6 cards are pushed', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.SecondHand,
                            secondHand: [
                                card(Faction.Enemy),
                                card(Faction.Enemy),
                            ],
                        } as TurnState,
                    ],
                    board: {
                        enemy: [
                            card(Faction.Enemy),
                            card(Faction.Enemy),
                            card(Faction.Enemy),
                            card(Faction.Enemy),
                            card(Faction.Enemy),
                        ],
                    } as BoardState,
                })
            )
            expect(state.victory).toBeNull()
            state.secondHand(0)
            expect(state.victory).not.toBeNull()
            expect(state.victory?.type).toBe(VictoryType.Cards)
            expect(state.victory?.team).toBe(Faction.Enemy)
        })
    })
    describe('playing a card', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    draw: buildDeck(3, 0),
                },
                state
            )
        it('sets board status to take action and sets the action to be taken', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 0,
                            position: 0,
                            status: TurnStatus.SecondHand,
                            secondHand: [
                                card(Faction.Enemy),
                                card(Faction.Enemy),
                            ],
                        } as TurnState,
                    ],
                    config: {
                        actions: [BoardAction.Execution],
                    } as ConfigurationOptions,
                })
            )
            expect(state.currentRound.number).toBe(0)
            state.secondHand(0)
            expect(state.currentRound.number).toBe(0)
            expect(state.currentRound.status).toBe(TurnStatus.TakeAction)
            expect(state.currentRound.action).toBe(BoardAction.Execution)
        })
        it('advances the turn when no action is to be taken', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 0,
                            position: 0,
                            status: TurnStatus.SecondHand,
                            secondHand: [
                                card(Faction.Enemy),
                                card(Faction.Enemy),
                            ],
                        } as TurnState,
                    ],
                    config: {
                        actions: [BoardAction.None],
                    } as ConfigurationOptions,
                })
            )
            expect(state.currentRound.number).toBe(0)
            state.secondHand(0)
            expect(state.currentRound.number).toBe(1)
        })
    })
    describe('policy peek', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(
                defaultState(StandardConfiguration[5]),
                {
                    config: {
                        actions: [BoardAction.PolicyPeek],
                    } as ConfigurationOptions,
                },
                state
            )
        it('does not allow action when status is not take action', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({ rounds: [{ position: 0 } as TurnState] })
            )
            const [cards, error] = state.policyPeek()
            expect(cards).toBe(undefined)
            expect(error?.toString()).toMatch(/turn state does not allow/i)
        })
        it('does not allow action when the turn state does not specify it', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.None,
                        } as TurnState,
                    ],
                })
            )
            const [cards, error] = state.policyPeek()
            expect(cards).toBe(undefined)
            expect(error?.toString()).toMatch(
                /action for the current turn is not/i
            )
        })
        it('does not change draw or discard and returns cards', () => {
            const draw = [
                { suit: Faction.Enemy },
                { suit: Faction.Ally },
                { suit: Faction.Enemy },
            ]
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 0,
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.PolicyPeek,
                        } as TurnState,
                    ],
                    draw,
                })
            )
            expect(state.drawSize).toBe(3)
            expect(state.discardSize).toBe(0)
            const [cards] = state.policyPeek()
            expect(cards).toEqual(draw)
            expect(state.drawSize).toBe(3)
            expect(state.discardSize).toBe(0)
        })
        it('advances the turn', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 0,
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.PolicyPeek,
                        } as TurnState,
                    ],
                    draw: [
                        { suit: Faction.Enemy },
                        { suit: Faction.Ally },
                        { suit: Faction.Enemy },
                    ],
                })
            )
            state.policyPeek()
            expect(state.currentRound.number).toBe(0)
            state.policyPeekOk()
            expect(state.currentRound.number).toBe(1)
        })
    })
    describe('special election', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(defaultState(StandardConfiguration[5]), {}, state)
        it('does not allow action when status is not take action', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({ rounds: [{ position: 0 } as TurnState] })
            )
            const [ok, error] = state.specialElection('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/turn state does not allow/i)
        })
        it('provides an error when action is not special election', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.specialElection('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(
                /action for the current turn is not special election/i
            )
        })
        it('provides an error when player does not exist', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.SpecialElection,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.specialElection('11111')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/does not exist/i)
        })
        it('provides an error when player is already executed', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    players: [
                        {
                            hasBeenExecuted: true,
                        } as PlayerState,
                    ],
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.SpecialElection,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.specialElection('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/Can not elect executed players/i)
        })
        it('advances the turn, sets special election flag, and sets proper position', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 0,
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.SpecialElection,
                        } as TurnState,
                    ],
                })
            )
            state.specialElection('4')
            expect(state.currentRound.number).toBe(1)
            expect(state.currentRound.specialElection).toBe(true)
            expect(state.currentRound.position).toBe(4)
        })
        it('returns to the proper position after the special election round', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 1,
                            position: 3,
                        } as TurnState,
                        {
                            number: 2,
                            position: 1,
                            specialElection: true,
                            nomination: '2',
                            status: TurnStatus.Election,
                        } as TurnState,
                    ],
                })
            )
            expect(state.currentRound.number).toBe(2)
            expect(state.currentRound.position).toBe(1)
            expect(state.currentRound.status).toBe(TurnStatus.Election)
            state.vote('0', VoteValue.No)
            state.vote('1', VoteValue.No)
            state.vote('2', VoteValue.No)
            state.vote('3', VoteValue.No)
            state.vote('4', VoteValue.No)
            expect(state.currentRound.number).toBe(3)
            expect(state.currentRound.position).toBe(4)
            expect(state.currentRound.status).toBe(TurnStatus.Nomination)
        })
    })
    describe('execution', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(defaultState(StandardConfiguration[5]), {}, state)
        it('does not allow action when status is not take action', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({ rounds: [{ position: 0 } as TurnState] })
            )
            const [ok, error] = state.executePlayer('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/turn state does not allow/i)
        })
        it('provides an error when action is not execute', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.executePlayer('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(
                /action for the current turn is not/i
            )
        })
        it('provides an error when player is already executed', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    players: [
                        {
                            hasBeenExecuted: true,
                        } as PlayerState,
                    ],
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.Execution,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.executePlayer('0')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/already been executed/i)
        })
        it('provides an error when player does not exist', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    players: [
                        {
                            hasBeenExecuted: true,
                        } as PlayerState,
                    ],
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.Execution,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.executePlayer('11111')
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/does not exist/i)
        })
        it('updates player status with `hasBeenExecuted` true', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.Execution,
                        } as TurnState,
                    ],
                })
            )
            expect(
                state.players(viewingPlayer).find((p) => p.id === '0')
                    ?.hasBeenExecuted
            ).toBeFalsy()
            state.executePlayer('0')
            expect(
                state.players(viewingPlayer).find((p) => p.id === '0')
                    ?.hasBeenExecuted
            ).toBeTruthy()
        })
        it('advances the turn', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            number: 0,
                            position: 0,
                            status: TurnStatus.TakeAction,
                            action: BoardAction.Execution,
                        } as TurnState,
                    ],
                })
            )
            state.executePlayer('0')
            expect(state.currentRound.number).toBe(1)
        })
    })
    describe('call veto', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(defaultState(StandardConfiguration[5]), {}, state)
        it('does not allow action when status is not take second hand', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({ rounds: [{ position: 0 } as TurnState] })
            )
            const [ok, error] = state.callVeto()
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(
                /must occur during the second hand/i
            )
        })
        it('does not allow vetoes when `enableVeto` is false', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            status: TurnStatus.SecondHand,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.callVeto()
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(
                /Veto is not enabled for this round/i
            )
        })
        it('does not allow vetoes before config specifies', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            status: TurnStatus.SecondHand,
                            enableVeto: true,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.callVeto()
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(
                /Not enough enemy cards have been played to allow veto/i
            )
        })
        it('does not allow vetoes without the second hand being drawn', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    board: {
                        enemy: [...cards(Faction.Enemy, 5)],
                    } as BoardState,
                    rounds: [
                        {
                            status: TurnStatus.SecondHand,
                            enableVeto: true,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.callVeto()
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/No cards have been drawn/i)
        })
        it('sets the turn status to veto when all checks pass', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    board: {
                        enemy: [...cards(Faction.Enemy, 5)],
                    } as BoardState,
                    rounds: [
                        {
                            enableVeto: true,
                            status: TurnStatus.SecondHand,
                            secondHand: [
                                { suit: Faction.Ally },
                                { suit: Faction.Ally },
                            ],
                        } as TurnState,
                    ],
                })
            )
            state.callVeto()
            expect(state.currentRound.status).toBe(TurnStatus.Veto)
        })
    })
    describe('veto vote', () => {
        const initial = (state: Partial<AlliesAndEnemiesState> = {}) =>
            merge(defaultState(StandardConfiguration[5]), {}, state)
        it('returns to a new first hand on a yes vote', () => {
            const secondHand = [{ suit: Faction.Ally }, { suit: Faction.Ally }]
            const drawCards = cards(Faction.Enemy, 3)
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    board: {
                        enemy: [...cards(Faction.Enemy, 5)],
                    } as BoardState,
                    rounds: [
                        {
                            status: TurnStatus.Veto,
                            secondHand,
                        } as TurnState,
                    ],
                    draw: drawCards,
                    config: {
                        deck: { enemyCards: 3, allyCards: 0 },
                    } as ConfigurationOptions,
                })
            )
            expect(state.currentRound.status).toBe(TurnStatus.Veto)
            expect(state.currentRound.secondHand).toStrictEqual(secondHand)

            expect(state.drawSize).toBe(3)
            expect(state.discardSize).toBe(0)

            state.vetoVote(VoteValue.Yes)

            expect(state.currentRound.status).toBe(TurnStatus.FirstHand)
            expect(state.currentRound.firstHand).toStrictEqual(drawCards)

            expect(state.drawSize).toBe(0)
            expect(state.discardSize).toBe(2)
        })
        it('provides an error when second hand is in an invalid state', () => {
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    rounds: [
                        {
                            status: TurnStatus.Veto,
                        } as TurnState,
                    ],
                })
            )
            const [ok, error] = state.vetoVote(VoteValue.Yes)
            expect(ok).toBe(false)
            expect(error?.toString()).toMatch(/invalid state/i)
        })
        it('returns to same second hand on a no vote', () => {
            const secondHand = [{ suit: Faction.Ally }, { suit: Faction.Ally }]
            const drawCards = cards(Faction.Enemy, 3)
            const state = new ActiveAlliesAndEnemiesState(
                initial({
                    board: {
                        enemy: [...cards(Faction.Enemy, 5)],
                    } as BoardState,
                    rounds: [
                        {
                            enableVeto: true,
                            secondHand,
                            status: TurnStatus.Veto,
                        } as TurnState,
                    ],
                    draw: drawCards,
                    config: {
                        deck: { enemyCards: 3, allyCards: 0 },
                    } as ConfigurationOptions,
                })
            )
            expect(state.currentRound.status).toBe(TurnStatus.Veto)
            expect(state.currentRound.secondHand).toStrictEqual(secondHand)
            expect(state.currentRound.enableVeto).toBe(true)

            expect(state.drawSize).toBe(3)
            expect(state.discardSize).toBe(0)

            state.vetoVote(VoteValue.No)

            expect(state.currentRound.status).toBe(TurnStatus.SecondHand)
            expect(state.currentRound.secondHand).toStrictEqual(secondHand)
            expect(state.currentRound.enableVeto).toBe(false)

            expect(state.drawSize).toBe(3)
            expect(state.discardSize).toBe(0)
        })
    })
})

import { GameId } from '@entities/Game'
import { IPlayer, PlayerId } from '@entities/Player'

export enum PlayerActionType {
    None,
    Nominate,
    Vote,
    PlayCard,
    TakeBoardAction,
}

export enum PlayerRole {
    Ally,
    Enemy,
    EnemyLeader,
}

export type PlayerState = IPlayer & {
    readonly position: number
    readonly role: PlayerRole
}

export type CardState = Card & {
    readonly discarded: boolean
}

export type FirstHand = [Card, Card, Card]
export type SecondHand = [Card, Card]

export enum TurnStatus {
    Nomination,
    Election,
    FirstHand,
    SecondHand,
}

export type TurnState = {
    readonly number: number
    readonly position: number
    readonly status: TurnStatus
    readonly nomination?: PlayerId
    readonly election?: boolean
    readonly firstHand?: FirstHand
    readonly secondHand?: SecondHand
    readonly vetoIsEnabled: boolean
}

export enum CardSuit {
    Ally,
    Enemy,
}

export type Card = {
    readonly suit: CardSuit
}

export enum BoardActionType {
    None,
    InvestigateLoyalty,
    SpecialElection,
    PolicyPeak,
    Execution,
}

export type BoardRow = {
    cards: Card[]
    maxCards: number
}

export type BoardState = {
    readonly actions: BoardActionType[]
    readonly ally: BoardRow
    readonly enemy: BoardRow
}

export type AlliesAndEnemiesState = {
    readonly board: BoardState
    readonly discard: Card[]
    readonly draw: Card[]
    readonly failedElections: number
    readonly gameId: GameId
    readonly leaderIsSecret: boolean
    readonly players: PlayerState[]
    readonly rounds: TurnState[]
}

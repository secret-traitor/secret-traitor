import { GameId } from '@entities/Game'
import { IPlayer, PlayerId } from '@entities/Player'
import { ConfigurationOptions } from '@games/AlliesAndEnemies/AlliesAndEnemies.config'

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

export enum VoteValue {
    No,
    Yes,
}

export type PlayerVote = {
    playerId: PlayerId
    vote: VoteValue
}

export type PlayerState = IPlayer & {
    readonly position: number
    readonly role: PlayerRole
}

export type ViewingPlayerState = Omit<PlayerState, 'role'> & {
    readonly role?: PlayerRole
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
    TakeAction,
}

export type TurnState = {
    readonly consecutiveFailedElections: number
    readonly elected: boolean
    readonly firstHand?: FirstHand
    readonly nomination?: PlayerId
    readonly number: number
    readonly position: number
    readonly secondHand?: SecondHand
    readonly status: TurnStatus
    readonly vetoIsEnabled: boolean
    readonly votes: PlayerVote[]
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
    readonly config: ConfigurationOptions
    readonly discard: Card[]
    readonly draw: Card[]
    readonly gameId: GameId
    readonly players: PlayerState[]
    readonly rounds: TurnState[]
}

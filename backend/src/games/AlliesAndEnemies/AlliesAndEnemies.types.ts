import { GameId } from '@entities/Game'
import { IPlayer, PlayerId } from '@entities/Player'
import { ConfigurationOptions } from '@games/AlliesAndEnemies/AlliesAndEnemies.config'

export enum PlayerRole {
    Unknown,
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
    readonly hasBeenExecuted?: boolean
    readonly position: number
    readonly role: PlayerRole
}

export type ViewingPlayerState = PlayerState & {
    readonly status: PlayerStatus
}

export enum PlayerStatus {
    None,
    President,
    Governor,
    Executed,
}

export type FirstHand = [Card, Card, Card]
export type SecondHand = [Card, Card]

export enum TurnStatus {
    Nomination,
    Election,
    FirstHand,
    SecondHand,
    TakeAction,
    Veto,
    GameOver,
}

export type TurnState = {
    readonly action?: BoardAction
    readonly consecutiveFailedElections: number
    readonly elected: boolean
    readonly enableVeto?: boolean
    readonly firstHand?: FirstHand
    readonly nomination?: PlayerId
    readonly number: number
    readonly position: number
    readonly secondHand?: SecondHand
    readonly specialElection?: boolean
    readonly status: TurnStatus
    readonly votes: PlayerVote[]
}

export enum Faction {
    Ally,
    Enemy,
}

export type Card = {
    readonly suit: Faction
}

export enum BoardAction {
    None,
    InvestigateLoyalty,
    SpecialElection,
    PolicyPeek,
    Execution,
}

export type BoardState = {
    readonly ally: Card[]
    readonly enemy: Card[]
}

export type AlliesAndEnemiesState = {
    readonly board: BoardState
    readonly config: ConfigurationOptions
    readonly discard: Card[]
    readonly draw: Card[]
    readonly gameId: GameId
    readonly players: PlayerState[]
    readonly rounds: TurnState[]
    readonly victory?: Victory
}

export type Victory = {
    team: Faction
    message: string
    type: VictoryType
}

export enum VictoryType {
    Cards,
    Election,
    Execution,
}

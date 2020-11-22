import { Player } from 'types/Player'
import { Game } from 'types/Game'

export enum BoardAction {
    Execution = 'Execution',
    InvestigateLoyalty = 'InvestigateLoyalty',
    None = 'None',
    PolicyPeek = 'PolicyPeek',
    SpecialElection = 'SpecialElection',
}

export enum Faction {
    Ally = 'Ally',
    Enemy = 'Enemy',
}

export type Card = {
    suit: Faction
}

export type BoardRow = {
    cards: Card[]
    maxCards: number
}

export type BoardState = {
    actions: BoardAction[]
    ally: BoardRow
    enemy: BoardRow
}

export enum PlayerAction {
    Nominate = 'Nominate',
    None = 'None',
    PlayCard = 'PlayCard',
    TakeBoardAction = 'TakeBoardAction',
    Vote = 'Vote',
}

export enum PlayerRole {
    Unknown = 'Unknown',
    Ally = 'Ally',
    Enemy = 'Enemy',
    EnemyLeader = 'EnemyLeader',
}

export enum PlayerStatus {
    None = 'None',
    President = 'President',
    Governor = 'Governor',
    Executed = 'Executed',
}

export type PlayerState = Player & {
    position: Required<number>
    role: PlayerRole
    status: PlayerStatus
}

export enum TurnStatus {
    Election = 'Election',
    FirstHand = 'FirstHand',
    Nomination = 'Nomination',
    SecondHand = 'SecondHand',
    TakeAction = 'TakeAction',
    Veto = 'Veto',
}

export type TurnState = {
    action?: BoardAction
    consecutiveFailedElections: number
    elected: boolean
    enableVeto: boolean
    firstHand?: [Card, Card, Card]
    ineligibleNominations: PlayerState[]
    nominatedPlayer?: PlayerState
    number: number
    position: Required<number>
    secondHand?: [Card, Card]
    specialElection: boolean
    status: Required<TurnStatus>
    waitingOn: Required<PlayerState>
}

export type AlliesAndEnemiesState = {
    board: BoardState
    currentTurn: TurnState
    players: PlayerState[]
    game: Game
    viewingPlayer: PlayerState
    victoryStatus?: Victory
}

export type Victory = {
    team: Faction
    message: string
    type: VictoryType
}

export enum VictoryType {
    Cards = 'Cards',
    Election = 'Election',
    Execution = 'Execution',
}

export type PlayerVote = 'Yes' | 'No'

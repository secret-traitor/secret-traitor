import { Player } from 'types/Player'

export type CurrentOffice = 'president' | 'governor'

export enum BoardAction {
    None,
    InvestigateLoyalty = 'InvestigateLoyalty',
    SpecialElection = 'SpecialElection',
    PolicyPeak = 'PolicyPeak',
    Execution = 'Execution',
}

export enum CardSuit {
    Ally,
    Enemy,
}

export type Card = {
    suit: CardSuit
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
    None = 'None',
    Nominate = 'Nominate',
    Vote = 'Vote',
    PlayCard = 'PlayCard',
    TakeBoardAction = 'TakeBoardAction',
}

export enum PlayerRole {
    Ally = 'Ally',
    Enemy = 'Enemy',
    EnemyLeader = 'EnemyLeader',
}

export type PlayerState = Player & {
    role?: PlayerRole
    position: Required<number>
}

export enum TurnStatus {
    Nomination = 'Nomination',
    Election = 'Election',
    FirstHand = 'FirstHand',
    SecondHand = 'SecondHand',
    TakeAction = 'TakeAction',
}

export type TurnState = {
    currentPlayer: Required<PlayerState>
    nominatedPlayer?: PlayerState
    number: number
    position: Required<number>
    status: Required<TurnStatus>
    disabledNominations: PlayerState[]
}

export type AlliesAndEnemiesState = {
    board: BoardState
    currentTurn: TurnState
    playerAction: PlayerAction
    players: PlayerState[]
    playId: string
    viewingPlayer: PlayerState
}

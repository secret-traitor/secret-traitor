import { Player } from 'types/Player'

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
    None,
    Nominate,
    Vote,
    PlayCard,
    TakeBoardAction,
}

export enum PlayerRole {
    Ally = 'Ally',
    Enemy = 'Enemy',
    EnemyLeader = 'EnemyLeader',
}

export enum TurnStatus {
    Nomination,
    Election,
    FirstHand,
    SecondHand,
}

export type TurnState = {
    number: number
    waitingOn: Player
    status: TurnStatus
}

export type TeamPlayer = Player & { role: PlayerRole }

export type TeamState = {
    playerRole: PlayerRole
    teammates: TeamPlayer[]
}

export type AlliesAndEnemiesState = {
    board: BoardState
    currentTurn?: TurnState
    player: Player
    playerAction: PlayerAction
    team: TeamState
    playId: string
}

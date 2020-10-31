import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

export enum GameType {
    AllisNEnemies,
}

export enum GameStatus {
    Archived = 'Archived',
    Closed = 'Closed',
    InLobby = 'InLobby',
    InProgress = 'InProgress',
}

export type Game = {
    id: string
    status: GameStatus
    type: GameType
}

export type GameState = AlliesAndEnemiesState

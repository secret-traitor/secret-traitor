import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import { Player } from './Player'

export enum GameType {
    AlliesNEnemies = 'AlliesNEnemies',
}

export enum GameStatus {
    Archived = 'Archived',
    Closed = 'Closed',
    InLobby = 'InLobby',
    InProgress = 'InProgress',
}

export type Game = {
    id: string
    players: Player[]
    status: GameStatus
    type: GameType
}

export type GameState = AlliesAndEnemiesState

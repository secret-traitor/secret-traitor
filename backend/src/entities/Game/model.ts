import { IPlayer } from '@entities/Player'

export enum GameClass {
    AlliesNEnemies,
}

export enum GameStatus {
    Closed,
    InLobby,
    InProgress,
    Archived,
}

export interface IGame {
    class: GameClass
    code: string
    host: IPlayer
    id: string
    status: GameStatus
}

export interface IGameType {
    description: string
    displayName: string
    gameClass: GameClass
}

export interface ICreateGameInput {
    playerCode: string
    gameClass: GameClass
}

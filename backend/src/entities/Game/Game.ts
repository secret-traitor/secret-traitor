export enum GameType {
    AlliesNEnemies,
}

export enum GameStatus {
    Closed,
    InLobby,
    InProgress,
    Archived,
}

export type GameId = string

export interface IGame {
    id: GameId
    status: GameStatus
    type: GameType
}

export interface IGameDescription {
    description: string
    displayName: string
    type: GameType
}

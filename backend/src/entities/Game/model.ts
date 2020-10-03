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
    hostPlayerCode: string
    id: string
    status: GameStatus
}

export interface IGameType {
    description: string
    displayName: string
    gameClass: GameClass
}

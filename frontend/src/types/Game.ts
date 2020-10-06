export enum GameStatus {
    Archived = 'Archived',
    Closed = 'Closed',
    InLobby = 'InLobby',
    InProgress = 'InProgress',
}

export type Game = {
    id: string
    status: GameStatus
}

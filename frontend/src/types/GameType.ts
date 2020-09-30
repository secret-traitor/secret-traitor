export enum GameClass {
    AllisNEnemies,
}

export type GameType = {
    description: string
    displayName: string
    gameClass: GameClass
}

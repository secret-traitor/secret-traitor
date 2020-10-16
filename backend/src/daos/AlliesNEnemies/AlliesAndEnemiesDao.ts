import { GameId } from '@entities/Game'

import {
    AlliesAndEnemiesState,
    BoardState,
    Card,
    PlayerState,
    TurnState,
} from '@games/AlliesAndEnemies'

export type Add = AlliesAndEnemiesState
export type Get = { gameId: GameId }
export type New = {
    board: BoardState
    deck: Card[]
    gameId: GameId
    leaderIsSecret: boolean
    players: PlayerState[]
}

export interface IAlliesAndEnemiesDao {
    add: (args: Add) => Promise<AlliesAndEnemiesState>
    get: (args: Get) => Promise<AlliesAndEnemiesState | null>
    new: (args: New) => Promise<AlliesAndEnemiesState | null>
}

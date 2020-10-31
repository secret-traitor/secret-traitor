import { GameId } from '@entities/Game'

import {
    AlliesAndEnemiesState,
    BoardState,
    Card,
    ConfigurationOptions,
    PlayerState,
} from '@games/AlliesAndEnemies'

export type Add = AlliesAndEnemiesState
export type Get = { gameId: GameId }
export type New = {
    config: ConfigurationOptions
    deck: Card[]
    gameId: GameId
    leaderIsSecret: boolean
    players: PlayerState[]
}
export type Put = AlliesAndEnemiesState

export interface IAlliesAndEnemiesDao {
    add: (args: Add) => Promise<AlliesAndEnemiesState>
    get: (args: Get) => Promise<AlliesAndEnemiesState | null>
    new: (args: New) => Promise<AlliesAndEnemiesState | null>
    put: (args: Put) => Promise<AlliesAndEnemiesState>
}

import { GameId } from '@entities/Game'
import { PlayerId } from '@entities/Player'

export type GamePlayerId = string

export interface IGamePlayer {
    id: GamePlayerId
    gameId: GameId
    playerId: PlayerId
    host: boolean
}

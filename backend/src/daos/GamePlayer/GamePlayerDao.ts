import { GameId } from '@entities/Game'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { PlayerId } from '@entities/Player'

export type AddGamePlayer = IGamePlayer
export type AllGamePlayers = {}
export type DeleteGamePlayer = GetGamePlayer
export type GetGamePlayer = { id: GamePlayerId }
export type FindGamePlayer = Partial<IGamePlayer>
export type NewGamePlayer = {
    gameId: GameId
    playerId: PlayerId
    host?: boolean
}
export type PutGamePlayer = AddGamePlayer

export interface IGamePlayerDao {
    add: (args: AddGamePlayer) => Promise<IGamePlayer>
    all: (args: AllGamePlayers) => Promise<IGamePlayer[]>
    delete: (args: DeleteGamePlayer) => Promise<boolean>
    find: (args: FindGamePlayer) => Promise<IGamePlayer[]>
    get: (args: GetGamePlayer) => Promise<IGamePlayer | null>
    new: (args: NewGamePlayer) => Promise<IGamePlayer>
    put: (args: PutGamePlayer) => Promise<IGamePlayer>
}

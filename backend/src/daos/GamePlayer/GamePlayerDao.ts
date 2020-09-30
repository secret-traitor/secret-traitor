import { IGamePlayer } from '@entities/GamePlayer'
import { IGame } from '@entities/Game'
import { IPlayer } from '@entities/Player'

export interface IGamePlayerDao {
    add: (game: IGamePlayer) => Promise<IGamePlayer | null>
    all: () => Promise<IGamePlayer[]>
    delete: (id: string) => Promise<void>
    find: (search: Partial<IGamePlayer>) => Promise<IGamePlayer[]>
    get: (id: string) => Promise<IGamePlayer | null>
    new: (
        game: IGame,
        player: IPlayer,
        host: boolean
    ) => Promise<IGamePlayer | null>
    put: (game: IGamePlayer) => Promise<IGamePlayer | null>
}

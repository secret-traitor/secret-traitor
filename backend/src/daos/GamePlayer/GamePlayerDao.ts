import { IGamePlayer } from '@entities/GamePlayer'

export type AddGamePlayer = IGamePlayer
export type AllGamePlayers = {}
export type DeleteGamePlayer = GetGamePlayer
export type FindGamePlayer = Partial<IGamePlayer>
export type GetGamePlayer = { id: string }
export type NewGamePlayer = {
    gameId: string
    playerCode: string
    host: boolean
}
export type PutGamePlayer = IGamePlayer

export interface IGamePlayerDao {
    add: (args: AddGamePlayer) => Promise<IGamePlayer | null>
    all: (args: AllGamePlayers) => Promise<IGamePlayer[]>
    delete: (args: DeleteGamePlayer) => Promise<boolean>
    find: (args: FindGamePlayer) => Promise<IGamePlayer[]>
    get: (args: GetGamePlayer) => Promise<IGamePlayer | null>
    new: (args: NewGamePlayer) => Promise<IGamePlayer | null>
    put: (args: PutGamePlayer) => Promise<IGamePlayer | null>
}

import { IPlayer } from '@entities/Player'

export type AddPlayer = IPlayer
export type AllPlayers = {}
export type DeletePlayer = GetPlayer
export type FindPlayer = Partial<IPlayer>
export type GetPlayer = { id: string }
export type ListPlayers = { ids: string[] }
export type NewPlayer = { id: string; nickname?: string }
export type PutPlayer = IPlayer

export interface IPlayerDao {
    add: (args: AddPlayer) => Promise<IPlayer>
    all: (args: AllPlayers) => Promise<IPlayer[]>
    delete: (args: DeletePlayer) => Promise<boolean>
    find: (args: FindPlayer) => Promise<IPlayer[]>
    get: (args: GetPlayer) => Promise<IPlayer | null>
    list: (args: ListPlayers) => Promise<IPlayer[]>
    new: (args: NewPlayer) => Promise<IPlayer>
    put: (args: PutPlayer) => Promise<IPlayer>
}

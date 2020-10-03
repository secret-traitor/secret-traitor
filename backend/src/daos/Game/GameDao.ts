import { GameClass, IGame } from '@entities/Game'

export type AddGame = { game: IGame }
export type AllGames = {}
export type DeleteGame = GetGame
export type SearchGames = Partial<IGame>
export type GetGame = { id: string }
export type NewGame = { hostPlayerCode: string; class: GameClass }
export type PutGame = { game: IGame }

export interface IGameDao {
    add: (args: AddGame) => Promise<IGame | null>
    all: (args: AllGames) => Promise<IGame[]>
    delete: (args: DeleteGame) => Promise<boolean>
    find: (args: SearchGames) => Promise<IGame[]>
    get: (args: GetGame) => Promise<IGame | null>
    new: (args: NewGame) => Promise<IGame | null>
    put: (args: PutGame) => Promise<IGame | null>
}

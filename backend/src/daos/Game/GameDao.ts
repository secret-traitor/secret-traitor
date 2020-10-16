import { GameType, IGame } from '@entities/Game'

export type AddGame = IGame
export type AllGames = {}
export type DeleteGame = GetGame
export type SearchGames = Partial<IGame>
export type GetGame = { id: string }
export type NewGame = { type: GameType }
export type PutGame = AddGame
export type SetGame = { id: string; game: Partial<IGame> }

export interface IGameDao {
    add: (args: AddGame) => Promise<IGame>
    all: (args: AllGames) => Promise<IGame[]>
    delete: (args: DeleteGame) => Promise<boolean>
    find: (args: SearchGames) => Promise<IGame[]>
    get: (args: GetGame) => Promise<IGame | null>
    new: (args: NewGame) => Promise<IGame>
    put: (args: PutGame) => Promise<IGame>
    set: (args: SetGame) => Promise<IGame | null>
}

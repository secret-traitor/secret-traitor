import { MockDaoMock } from '@daos/MockDb/MockDao.mock'

import {
    AddGame,
    AllGames,
    DeleteGame,
    GetGame,
    IGameDao,
    NewGame,
    PutGame,
    SearchGames,
    SetGame,
} from './GameDao'
import { UUID } from '@shared/uuid'
import { GameStatus, IGame } from '@entities/Game'

function makeCode(length: number) {
    let result = ''
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        )
    }
    return result
}

class GameDaoMock extends MockDaoMock implements IGameDao {
    public async add(args: AddGame): Promise<IGame> {
        const db = await super.openDb()
        db.games.push(args)
        await super.saveDb(db)
        return args
    }

    public async all(args: AllGames = {}): Promise<IGame[]> {
        const db = await super.openDb()
        return db.games
    }

    public async delete(args: DeleteGame): Promise<boolean> {
        const db = await super.openDb()
        for (let i = 0; i < db.games.length; i++) {
            if (db.games[i].id === args.id) {
                db.games.splice(i, 1)
                await super.saveDb(db)
                return true
            }
        }
        return false
    }

    public async find(search: SearchGames): Promise<IGame[]> {
        const matches: IGame[] = []
        const db = await super.openDb()
        for (const game of db.games) {
            const isMatch = Object.entries(search)
                .map(([field, value]) => game[field] === value)
                .every(Boolean)
            if (isMatch) matches.push(game)
        }
        return matches
    }

    public async get(args: GetGame): Promise<IGame | null> {
        const db = await super.openDb()
        for (const game of db.games) {
            if (game.id === args.id) {
                return game
            }
        }
        return null
    }

    public async new(args: NewGame): Promise<IGame> {
        const game: IGame = {
            ...args,
            id: makeCode(6),
            status: GameStatus.InLobby,
        }
        return this.add(game)
    }

    public async put(args: PutGame): Promise<IGame> {
        const db = await super.openDb()
        for (let i = 0; i < db.games.length; i++) {
            if (db.games[i].id === args.id) {
                db.games[i] = args
                await super.saveDb(db)
                return args
            }
        }
        return this.add(args as AddGame)
    }

    public async set(args: SetGame): Promise<IGame | null> {
        const db = await super.openDb()
        for (let i = 0; i < db.games.length; i++) {
            if (db.games[i].id === args.id) {
                db.games[i] = { ...db.games[i], ...args.game }
                await super.saveDb(db)
                return db.games[i]
            }
        }
        return null
    }
}

export default GameDaoMock

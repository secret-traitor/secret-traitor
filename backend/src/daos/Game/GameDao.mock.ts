import { v4 as uuid } from 'uuid'

import logger from '@shared/Logger'

import Game, { GameStatus, IGame } from '@entities/Game'

import { MockDaoMock } from '../MockDb/MockDao.mock'
import {
    AddGame,
    AllGames,
    DeleteGame,
    GetGame,
    IGameDao,
    NewGame,
    PutGame,
    SearchGames,
} from './GameDao'
import { IPlayer } from '@entities/Player'

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

const GameDaoMock = class extends MockDaoMock implements IGameDao {
    public async add(args: AddGame): Promise<IGame | null> {
        try {
            const db = await super.openDb()
            db.games.push(args.game)
            await super.saveDb(db)
            return this.get({ id: args.game.id })
        } catch (err) {
            throw err
        }
    }

    public async all(args: AllGames): Promise<IGame[]> {
        try {
            const db = await super.openDb()
            return db.games
        } catch (err) {
            throw err
        }
    }

    public async delete(args: DeleteGame): Promise<boolean> {
        try {
            const db = await super.openDb()
            for (let i = 0; i < db.games.length; i++) {
                if (db.games[i].id === args.id) {
                    db.games.splice(i, 1)
                    await super.saveDb(db)
                    return true
                }
            }
            return false
        } catch (err) {
            throw err
        }
    }

    public async find(search: SearchGames): Promise<IGame[]> {
        try {
            const matches: IGame[] = []
            const db = await super.openDb()
            for (const game of db.games) {
                const isMatch = Object.entries(search)
                    .map(([field, value]) => game[field] === value)
                    .every(Boolean)
                if (isMatch) matches.push(game)
            }
            return matches
        } catch (err) {
            throw err
        }
    }

    public async get(args: GetGame): Promise<IGame | null> {
        try {
            const db = await super.openDb()
            for (const game of db.games) {
                if (game.id === args.id) {
                    return game
                }
            }
            return null
        } catch (err) {
            throw err
        }
    }

    public async new(args: NewGame): Promise<IGame | null> {
        try {
            const game: IGame = {
                class: args.class,
                code: makeCode(6),
                host: args.host,
                id: uuid(),
                status: GameStatus.InLobby,
            }
            return this.add({ game })
        } catch (err) {
            throw err
        }
    }

    public async put(args: PutGame): Promise<IGame | null> {
        try {
            const db = await super.openDb()
            for (let i = 0; i < db.games.length; i++) {
                if (db.games[i].id === args.game.id) {
                    db.games[i] = args.game
                    await super.saveDb(db)
                    return this.get({ id: args.game.id })
                }
            }
            throw new Error('Game not found')
        } catch (err) {
            throw err
        }
    }
}

export default GameDaoMock

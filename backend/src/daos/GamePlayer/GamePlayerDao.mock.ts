import { v4 as uuid } from 'uuid'

import { MockDaoMock } from '@daos/MockDb/MockDao.mock'

import { IGamePlayer } from '@entities/GamePlayer'

import {
    AddGamePlayer,
    AllGamePlayers,
    DeleteGamePlayer,
    FindGamePlayer,
    GetGamePlayer,
    IGamePlayerDao,
    NewGamePlayer,
    PutGamePlayer,
} from './GamePlayerDao'

class GamePlayerDaoMock extends MockDaoMock implements IGamePlayerDao {
    public async add(args: AddGamePlayer): Promise<IGamePlayer | null> {
        try {
            const db = await super.openDb()
            db.gamePlayers.push(args)
            await super.saveDb(db)
            return this.get(args as GetGamePlayer)
        } catch (err) {
            throw err
        }
    }

    public async all(args: AllGamePlayers = {}): Promise<IGamePlayer[]> {
        try {
            const db = await super.openDb()
            return db.gamePlayers
        } catch (err) {
            throw err
        }
    }

    public async delete(args: DeleteGamePlayer): Promise<boolean> {
        try {
            const db = await super.openDb()
            for (let i = 0; i < db.gamePlayers.length; i++) {
                if (db.gamePlayers[i].id === args.id) {
                    db.gamePlayers.splice(i, 1)
                    await super.saveDb(db)
                    return true
                }
            }
            return false
        } catch (err) {
            throw err
        }
    }

    public async find(args: FindGamePlayer): Promise<IGamePlayer[]> {
        try {
            const matches: IGamePlayer[] = []
            const db = await super.openDb()
            for (const game of db.gamePlayers) {
                const isMatch = Object.entries(args)
                    .map(([field, value]) => game[field] === value)
                    .every(Boolean)
                if (isMatch) matches.push(game)
            }
            return matches
        } catch (err) {
            throw err
        }
    }

    public async get(args: GetGamePlayer): Promise<IGamePlayer | null> {
        try {
            const db = await super.openDb()
            for (const game of db.gamePlayers) {
                if (game.id === args.id) {
                    return game
                }
            }
            return null
        } catch (err) {
            throw err
        }
    }

    public async new(args: NewGamePlayer): Promise<IGamePlayer | null> {
        try {
            const gamePlayer: IGamePlayer = {
                id: uuid(),
                ...args,
            }
            return this.add(gamePlayer)
        } catch (err) {
            throw err
        }
    }

    public async put(args: PutGamePlayer): Promise<IGamePlayer | null> {
        try {
            const db = await super.openDb()
            for (let i = 0; i < db.gamePlayers.length; i++) {
                if (db.gamePlayers[i].id === args.id) {
                    db.gamePlayers[i] = args
                    await super.saveDb(db)
                    return this.get(args as GetGamePlayer)
                }
            }
            return this.add(args as AddGamePlayer)
        } catch (err) {
            throw err
        }
    }
}

export default GamePlayerDaoMock

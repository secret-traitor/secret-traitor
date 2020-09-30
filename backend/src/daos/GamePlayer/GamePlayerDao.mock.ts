import { v4 as uuid } from 'uuid'

import logger from '@shared/Logger'

import { MockDaoMock } from '@daos/MockDb/MockDao.mock'

import { GamePlayer, IGamePlayer } from '@entities/GamePlayer'
import { IGame } from '@entities/Game'
import { IPlayer } from '@entities/Player'

import { IGamePlayerDao } from './GamePlayerDao'

class GamePlayerDaoMock extends MockDaoMock implements IGamePlayerDao {
    public async add(gamePlayer: IGamePlayer): Promise<IGamePlayer | null> {
        try {
            const db = await super.openDb()
            db.gamePlayers.push(gamePlayer)
            await super.saveDb(db)
            return this.get(gamePlayer.id)
        } catch (err) {
            throw err
        }
    }

    public async all(): Promise<IGamePlayer[]> {
        try {
            const db = await super.openDb()
            return db.gamePlayers
        } catch (err) {
            throw err
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            const db = await super.openDb()
            for (let i = 0; i < db.gamePlayers.length; i++) {
                if (db.gamePlayers[i].id === id) {
                    db.gamePlayers.splice(i, 1)
                    await super.saveDb(db)
                    return
                }
            }
            throw new Error('Game not found')
        } catch (err) {
            throw err
        }
    }

    public async find(search: Partial<IGamePlayer>): Promise<IGamePlayer[]> {
        try {
            const matches: IGamePlayer[] = []
            const db = await super.openDb()
            for (const game of db.gamePlayers) {
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

    public async get(id: string): Promise<IGamePlayer | null> {
        try {
            const db = await super.openDb()
            for (const game of db.gamePlayers) {
                if (game.id === id) {
                    return game
                }
            }
            return null
        } catch (err) {
            throw err
        }
    }

    public async new(
        game: IGame,
        player: IPlayer,
        host: boolean
    ): Promise<IGamePlayer | null> {
        try {
            const gamePlayer: IGamePlayer = {
                id: uuid(),
                gameId: game.id,
                playerCode: player.code,
                host: true,
            }
            return this.add(gamePlayer)
        } catch (err) {
            throw err
        }
    }

    public async put(gamePlayer: IGamePlayer): Promise<IGamePlayer | null> {
        try {
            const db = await super.openDb()
            for (let i = 0; i < db.gamePlayers.length; i++) {
                if (db.gamePlayers[i].id === gamePlayer.id) {
                    db.gamePlayers[i] = gamePlayer
                    await super.saveDb(db)
                    return this.get(gamePlayer.id)
                }
            }
            throw new Error('Game not found')
        } catch (err) {
            throw err
        }
    }
}

export default GamePlayerDaoMock

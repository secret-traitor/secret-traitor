import find from 'lodash/find'
import { MockDaoMock } from '@daos/MockDb/MockDao.mock'
import { AlliesAndEnemiesState, TurnStatus } from '@games/AlliesAndEnemies'
import { Add, Get, IAlliesAndEnemiesDao, New, Put } from './AlliesAndEnemiesDao'
import { AddGame, PutGame } from '@daos/Game'
import { IGame } from '@entities/Game'

class AlliesAndEnemiesDaoMock
    extends MockDaoMock<{
        alliesAndEnemies: AlliesAndEnemiesState[]
    }>
    implements IAlliesAndEnemiesDao {
    async add(args: Add): Promise<AlliesAndEnemiesState> {
        const db = await this.db()
        const exists = find(
            db.alliesAndEnemies,
            (state: AlliesAndEnemiesState) => state.gameId === args.gameId
        )
        if (!exists) {
            db.alliesAndEnemies.push(args)
            await super.saveDb(db)
            return args as AlliesAndEnemiesState
        }
        throw Error('This game already exists!')
    }

    async new(args: New): Promise<AlliesAndEnemiesState | null> {
        return await this.add({
            ...args,
            draw: args.deck,
            discard: [],
            failedElections: 0,
            rounds: [
                {
                    consecutiveFailedElections: 0,
                    elected: false,
                    number: 1,
                    position: 0,
                    status: TurnStatus.Nomination,
                    votes: [],
                },
            ],
            board: {
                ally: [],
                enemy: [],
            },
        } as Add)
    }

    async get(args: Get): Promise<AlliesAndEnemiesState | null> {
        const { alliesAndEnemies } = await this.db()
        return (
            find(alliesAndEnemies, (state) => state.gameId === args.gameId) ||
            null
        )
    }

    public async put(args: Put): Promise<AlliesAndEnemiesState> {
        const db = await super.openDb()
        for (let i = 0; i < db.alliesAndEnemies.length; i++) {
            if (db.alliesAndEnemies[i].gameId === args.gameId) {
                db.alliesAndEnemies[i] = args
                await super.saveDb(db)
                return args
            }
        }
        return this.add(args as Add)
    }
}

export default AlliesAndEnemiesDaoMock

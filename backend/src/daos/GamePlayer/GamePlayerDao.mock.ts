import filter from 'lodash/filter'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'

import { MockDaoMock } from '@daos/MockDb/MockDao.mock'

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
import { UUID } from '@shared/uuid'
import { IGamePlayer } from '@entities/GamePlayer'

type DB = {
    gamePlayers: IGamePlayer[]
}

class GamePlayerDaoMock extends MockDaoMock<DB> implements IGamePlayerDao {
    public async add(args: AddGamePlayer): Promise<IGamePlayer> {
        const db = await this.db()
        const exists = find(
            db.gamePlayers,
            (gp: IGamePlayer) =>
                gp.playerId === args.playerId && gp.gameId === args.gameId
        )
        if (!exists) {
            db.gamePlayers.push(args)
            await super.saveDb(db)
            return args as IGamePlayer
        }
        throw Error('This player is already in this game.')
    }

    public async all({}: AllGamePlayers = {}): Promise<IGamePlayer[]> {
        const { gamePlayers } = await this.db()
        return gamePlayers
    }

    public async delete(args: DeleteGamePlayer): Promise<boolean> {
        const db = await this.db()
        const i = findIndex(db.gamePlayers, (gp: IGamePlayer) => gp === args)
        if (i < 0) {
            return false
        }
        db.gamePlayers.splice(i, 1)
        await super.saveDb(db)
        return true
    }

    public async find(args: FindGamePlayer): Promise<IGamePlayer[]> {
        const { gamePlayers } = await this.db()
        return filter(gamePlayers, (gp: any) => {
            return Object.entries(args)
                .map(([field, value]) => gp[field] === value)
                .every(Boolean)
        })
    }

    public async get({ id }: GetGamePlayer): Promise<IGamePlayer | null> {
        const db = await this.db()
        return find(db.gamePlayers, (gp) => gp.id === id) || null
    }

    public async new(args: NewGamePlayer): Promise<IGamePlayer> {
        const isHost = args.host ?? false
        return this.add({
            ...args,
            host: isHost,
            id: UUID(),
        })
    }

    public async put(args: PutGamePlayer): Promise<IGamePlayer> {
        const db = await this.db()
        const i = findIndex(
            db.gamePlayers,
            (gp) => gp.playerId === args.playerId && gp.gameId === args.gameId
        )
        if (i < 0) {
            return this.add(args as AddGamePlayer)
        }
        db.gamePlayers[i] = args as IGamePlayer
        await super.saveDb(db)
        return args as IGamePlayer
    }
}

export default GamePlayerDaoMock

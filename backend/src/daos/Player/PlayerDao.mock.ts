import filter from 'lodash/filter'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import includes from 'lodash/includes'

import { MockDaoMock } from '@daos/MockDb/MockDao.mock'

import {
    AddPlayer,
    AllPlayers,
    DeletePlayer,
    FindPlayer,
    GetPlayer,
    IPlayerDao,
    ListPlayers,
    NewPlayer,
    PutPlayer,
} from '@daos/Player'
import { IPlayer } from '@entities/Player'
import { UUID } from '@shared/uuid'
import { IGamePlayer } from '@entities/GamePlayer'
import { AddGamePlayer } from '@daos/GamePlayer'

type DB = {
    players: IPlayer[]
}

class PlayerDaoMock extends MockDaoMock<DB> implements IPlayerDao {
    public async add(args: AddPlayer): Promise<IPlayer> {
        const db = await this.db()
        const exists = find(db.players, (gp: IPlayer) => gp.id === args.id)
        if (!exists) {
            db.players.push(args)
            await super.saveDb(db)
            return args as IPlayer
        }
        throw Error('Player already exists.')
    }

    public async all({}: AllPlayers = {}): Promise<IPlayer[]> {
        const { players } = await this.db()
        return players
    }

    public async delete({ id }: DeletePlayer): Promise<boolean> {
        const db = await this.db()
        const i = findIndex(db.players, (p) => p.id === id)
        if (i < 0) {
            return false
        }
        db.players.splice(i, 1)
        await super.saveDb(db)
        return true
    }

    public async find(args: FindPlayer): Promise<IPlayer[]> {
        const { players } = await this.db()
        return filter(players, (p: any) =>
            Object.entries(args)
                .map(([field, value]) => p[field] === value)
                .every(Boolean)
        )
    }

    public async get({ id }: GetPlayer): Promise<IPlayer | null> {
        const db = await this.db()
        return find(db.players, (p) => p.id === id) || null
    }

    public async list({ ids }: ListPlayers): Promise<IPlayer[]> {
        const db = await this.db()
        return filter(db.players, (p) => includes(ids, p.id))
    }

    public async new(args: NewPlayer): Promise<IPlayer> {
        return this.add({ ...args })
    }

    public async put(args: PutPlayer): Promise<IPlayer> {
        const db = await this.db()
        const i = findIndex(db.players, (p) => p.id === args.id)
        if (i < 0) {
            return this.add(args as AddPlayer)
        }
        db.players[i] = args as IPlayer
        await super.saveDb(db)
        return args as IPlayer
    }
}

export default PlayerDaoMock

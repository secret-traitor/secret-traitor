import { Arg, Query, Resolver } from 'type-graphql'

import { IGameDao } from '@daos/Game'
import GameDaoMock from '@daos/Game/GameDao.mock'
import { IGamePlayerDao } from '@daos/GamePlayer'
import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'

import { GamePlayer } from './typeDefs'

@Resolver(() => GamePlayer)
export class GamePlayerResolver {
    private gameDao: IGameDao
    private gamePlayerDao: IGamePlayerDao

    constructor() {
        this.gameDao = new GameDaoMock()
        this.gamePlayerDao = new GamePlayerDaoMock()
    }
}

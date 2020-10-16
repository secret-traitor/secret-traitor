import { Container } from 'typedi'

import AlliesAndEnemiesDaoMock from '@daos/AlliesNEnemies/AlliesAndEnemiesDao.mock'
import GameDaoMock from '@daos/Game/GameDao.mock'
import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'
import PlayerDaoMock from '@daos/Player/PlayerDao.mock'

Container.set('AlliesAndEnemies', new AlliesAndEnemiesDaoMock())
Container.set('GamePlayers', new GamePlayerDaoMock())
Container.set('Games', new GameDaoMock())
Container.set('Players', new PlayerDaoMock())

export default Container

export function inject<T = any>(name: string) {
    return (Container.get(name) as unknown) as T
}

import { Container } from 'typedi'

import GameDaoMock from '@daos/Game/GameDao.mock'
import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'
import PlayerDaoMock from '@daos/Player/PlayerDao.mock'

Container.set('GamePlayers', new GamePlayerDaoMock())
Container.set('Games', new GameDaoMock())
Container.set('Players', new PlayerDaoMock())

export default Container

import { DataSources as BaseDataSources } from 'apollo-server-core/src/graphqlOptions'

import AlliesAndEnemiesStateDataSource from '@entities/AlliesAndEnemies/DataSource'
import GamesDataSource from '@entities/Game/DataSource'
import PlayersDataSource from '@entities/Player/DataSource'
import Context from '@shared/Context'

interface DataSources extends BaseDataSources<Context> {
    alliesAndEnemies: AlliesAndEnemiesStateDataSource
    games: GamesDataSource
    players: PlayersDataSource
}

export default DataSources

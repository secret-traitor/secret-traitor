import { DataSources as IDataSources } from 'apollo-server-core/src/graphqlOptions'

import Context from '@shared/Context'
import GamesDataSource from '@entities/Game/DataSource'
import AlliesAndEnemiesStateDataSource from '@entities/AlliesAndEnemies/DataSource'

interface DataSources extends IDataSources<Context> {
    games: GamesDataSource
    alliesAndEnemies: AlliesAndEnemiesStateDataSource
}

export default DataSources

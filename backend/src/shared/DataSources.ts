import { DataSources as BaseDataSources } from 'apollo-server-core/src/graphqlOptions'

import AlliesAndEnemiesStateDataSource from 'src/entities/AlliesAndEnemies/DataSource'
import GamesDataSource from 'src/entities/Game/DataSource'
import PlayersDataSource from 'src/entities/Player/DataSource'
import Context from 'src/shared/Context'

interface DataSources extends BaseDataSources<Context> {
    alliesAndEnemies: AlliesAndEnemiesStateDataSource
    games: GamesDataSource
    players: PlayersDataSource
}

export default DataSources

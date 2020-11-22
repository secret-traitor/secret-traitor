import AlliesAndEnemiesStateDataSource from '@entities/AlliesAndEnemies/DataSource'
import GamesDataSource from '@entities/Game/DataSource'
import DataSources from '@shared/DataSources'

const buildDataSources = (): DataSources => ({
    games: new GamesDataSource(),
    alliesAndEnemies: new AlliesAndEnemiesStateDataSource(),
})

export default buildDataSources

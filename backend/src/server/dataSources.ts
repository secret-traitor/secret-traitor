import AlliesAndEnemiesStateDataSource from 'src/entities/AlliesAndEnemies/DataSource'
import GamesDataSource from 'src/entities/Game/DataSource'
import PlayersDataSource from 'src/entities/Player/DataSource'
import DataSources from 'src/shared/DataSources'

const dataSources = (): DataSources => ({
    alliesAndEnemies: new AlliesAndEnemiesStateDataSource(),
    games: new GamesDataSource(),
    players: new PlayersDataSource(),
})

export default dataSources

import AlliesAndEnemiesStateDataSource from '@entities/AlliesAndEnemies/DataSource'
import GamesDataSource from '@entities/Game/DataSource'
import PlayersDataSource from '@entities/Player/DataSource'
import DataSources from '@shared/DataSources'

export const buildDataSources = (): DataSources => ({
    alliesAndEnemies: new AlliesAndEnemiesStateDataSource(),
    games: new GamesDataSource(),
    players: new PlayersDataSource(),
})

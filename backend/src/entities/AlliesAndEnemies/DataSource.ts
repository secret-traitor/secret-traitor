import { DataSource, DataSourceConfig } from 'apollo-datasource'
import DataLoader from 'dataloader'

import GamesClient from '@clients/Games'
import Context from '@shared/Context'
import { GameId, IGame } from '@entities/Game'
import { AlliesAndEnemiesState } from '@entities/AlliesAndEnemies/AlliesAndEnemies.types'
import { ActiveAlliesAndEnemiesState } from '@entities/AlliesAndEnemies/AlliesAndEnemies.game'
import { PlayerId } from '@entities/Player'
import { DescriptiveError } from '@shared/api'

class AlliesAndEnemiesStateDataSource extends DataSource<Context> {
    private loader = new DataLoader<GameId, AlliesAndEnemiesState>(
        async (keys) =>
            await GamesClient.state.list<AlliesAndEnemiesState>([...keys])
    )
    async get(
        gameId: GameId,
        playerId: PlayerId
    ): Promise<ActiveAlliesAndEnemiesState> {
        const state = await this.loader.load(gameId)
        if (!state) {
            throw new DescriptiveError(
                'Unable to look up game state.',
                'No state data for this game found.'
            )
        }
        return new ActiveAlliesAndEnemiesState(state, playerId)
    }
}
export default AlliesAndEnemiesStateDataSource

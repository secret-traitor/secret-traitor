import { DataSource, DataSourceConfig } from 'apollo-datasource'
import DataLoader from 'dataloader'

import GamesClient from '@clients/Games'
import { GameId, IGame } from '@entities/Game'
import Context from '@shared/Context'

class GamesDataSource extends DataSource<Context> {
    private loader = new DataLoader<GameId, IGame>(
        async (keys) => await GamesClient.games.list([...keys])
    )
    async get(id: GameId): Promise<IGame> {
        return this.loader.load(id)
    }
}
export default GamesDataSource

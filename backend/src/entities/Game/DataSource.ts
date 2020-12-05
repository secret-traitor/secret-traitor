import { DataSource } from 'apollo-datasource'
import DataLoader from 'dataloader'

import GamesClient from 'src/clients/Games'
import { Condition } from 'src/clients/dynamoDb'
import { GameId, GameType, IGame } from 'src/entities/Game'
import Context from 'src/shared/Context'

class GamesDataSource extends DataSource<Context> {
    private loader = new DataLoader<GameId, any>(async (keys) => {
        const results: IGame[] = await GamesClient.games.list([...keys])
        const reduced: Record<string, IGame> = results.reduce(
            (acc, s) => ({
                ...acc,
                [s.id]: s,
            }),
            {}
        )
        return keys.map((k) => reduced[k] || undefined)
    })
    public async create(gameType: GameType) {
        return await GamesClient.games.create(gameType)
    }
    public async load(id: GameId): Promise<IGame> {
        return await this.loader.load(id)
    }
    public async put(game: IGame) {
        await GamesClient.games.put(game)
        return game
    }
    public async scan(filter: { [key: string]: Condition }): Promise<IGame[]> {
        return await GamesClient.games.scan(filter)
    }
}
export default GamesDataSource

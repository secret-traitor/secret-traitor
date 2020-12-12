import { DataSource } from 'apollo-datasource'

import { Condition } from 'src/clients/dynamoDb'
import GamesClient from 'src/clients/Games'
import { GameId } from 'src/entities/Game'
import { IPlayer, PlayerId } from 'src/entities/Player/Player'
import Context from 'src/shared/Context'

class PlayersDataSource extends DataSource<Context> {
    async get(
        gameId: GameId,
        playerId: PlayerId
    ): Promise<IPlayer | undefined> {
        return await GamesClient.players.get(gameId, playerId)
    }
    public async create(
        gameId: GameId,
        playerId: PlayerId,
        host: boolean = false,
        nickname?: string
    ) {
        return await GamesClient.players.create(
            gameId,
            playerId,
            host,
            nickname
        )
    }
    public async list(gameId: GameId): Promise<IPlayer[]> {
        return await GamesClient.players.list(gameId)
    }
    public async put(gameId: GameId, player: IPlayer) {
        await GamesClient.players.put({ gameId, ...player })
        return player
    }
    public async update(
        gameId: GameId,
        player: Partial<IPlayer> & { id: PlayerId }
    ) {
        await GamesClient.players.update({ gameId, ...player })
        return player
    }
    public async scan(filter: {
        [key: string]: Condition
    }): Promise<IPlayer[]> {
        return await GamesClient.players.scan(filter)
    }
}
export default PlayersDataSource

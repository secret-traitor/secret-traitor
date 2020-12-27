import dynamoDb, {
    Condition,
    scan,
    put,
    putMany,
    waitForTable as waitFor,
} from 'src/clients/dynamoDb'
import { GameId, GameStatus, GameType, IGame } from 'src/entities/Game'
import { IPlayer, PlayerId } from 'src/entities/Player'

const TableName = process.env.GAMES_TABLE_NAME as string
export const waitForTable = async () => waitFor(TableName)

export type GameModel = {
    EntityType: 'game'
    Status: GameStatus
    Type: GameType
    SK: string
    PK: string
}
export type PlayerModel = {
    EntityType: 'player'
    SK: string
    Host?: boolean
    PK: string
    Name?: string
}
export type StateModel = {
    EntityType: 'state'
    State: any
    SK: string
    PK: string
}

class GamesClient {
    private entityType = 'game'

    async create(type: GameType): Promise<IGame> {
        const game: IGame = {
            status: GameStatus.InLobby,
            type,
            id: this.makeCode(),
        }
        await this.put(game)
        return game
    }

    async scan(filter: { [key: string]: Condition }): Promise<IGame[]> {
        const result = await scan({
            ScanFilter: filter,
            EntityType: this.entityType,
            TableName,
        })
        return result.Items?.map(this.fromDynamo) ?? []
    }

    async get(id: GameId): Promise<IGame | undefined> {
        return dynamoDb
            .get({
                TableName,
                Key: {
                    PK: `g#${id.toLowerCase()}`,
                    SK: `g#${id.toLowerCase()}`,
                },
            })
            .promise()
            .then((result) =>
                result.Item ? this.fromDynamo(result.Item) : undefined
            )
    }

    async list(ids: GameId[]): Promise<IGame[]> {
        const AttributeValueList = ids.map((id) => `g#${id.toLowerCase()}`)
        return await dynamoDb
            .query({
                TableName,
                KeyConditions: {
                    PK: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList,
                    },
                    SK: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList,
                    },
                },
                Limit: ids.length,
            })
            .promise()
            .then((results) =>
                results.Items ? results.Items.map(this.fromDynamo) : []
            )
    }

    async put(args: IGame | IGame[]): Promise<any> {
        return Array.isArray(args)
            ? putMany({
                  Items: args.map(this.toDynamo),
                  TableName,
              })
            : put({
                  Item: this.toDynamo(args),
                  TableName,
              })
    }

    private readonly toDynamo = (game: IGame): GameModel =>
        ({
            EntityType: this.entityType,
            PK: `g#${game.id.toLowerCase()}`,
            SK: `g#${game.id.toLowerCase()}`,
            Status: game.status,
            Type: game.type,
        } as GameModel)

    private readonly fromDynamo = (result: any): IGame => ({
        id: result.PK.replace('g#', '').toLowerCase(),
        status: result.Status,
        type: result.Type,
    })

    private readonly makeCode = () => {
        const length = 6
        let result = ''
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * characters.length)
            )
        }
        return result
    }
}

type PutPlayer = IPlayer & { gameId: GameId }
type UpdatePlayer = Partial<IPlayer> & { id: PlayerId; gameId: GameId }

class PlayersClient {
    private entityType = 'player'

    async create(
        gameId: GameId,
        playerId: PlayerId,
        host?: boolean,
        nickname?: string
    ): Promise<IPlayer> {
        const player: IPlayer = { id: playerId, nickname, host }
        await this.put({ ...player, gameId })
        return player
    }

    async scan(filter: { [key: string]: Condition }): Promise<IPlayer[]> {
        const result = await scan({
            ScanFilter: filter,
            EntityType: this.entityType,
            TableName,
        })
        return result.Items?.map(this.fromDynamo) ?? []
    }

    async get(
        gameId: GameId,
        playerId: PlayerId
    ): Promise<IPlayer | undefined> {
        return dynamoDb
            .get({
                TableName,
                Key: {
                    PK: `g#${gameId}`,
                    SK: `p#${playerId}`,
                },
            })
            .promise()
            .then((result) =>
                result.Item ? this.fromDynamo(result.Item) : undefined
            )
    }

    async list(gameId: GameId): Promise<IPlayer[]> {
        return await dynamoDb
            .query({
                TableName,
                KeyConditions: {
                    PK: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [`g#${gameId}`],
                    },
                    SK: {
                        ComparisonOperator: 'BEGINS_WITH',
                        AttributeValueList: ['p#'],
                    },
                },
            })
            .promise()
            .then((results) =>
                results.Items ? results.Items.map(this.fromDynamo) : []
            )
    }

    async update(player: UpdatePlayer): Promise<any> {
        const mapped = this.toDynamo(player)
        const Key = {
            PK: mapped.PK,
            SK: mapped.SK,
        }
        const UpdateExpression = `set ${[
            ...(mapped.Name ? ['#N = :n'] : []),
            ...(mapped.Host ? ['#H = :h'] : []),
            '#E = :e',
        ].join(',')}`
        const ExpressionAttributeNames = {
            ...(mapped.Name ? { '#N': 'Name' } : {}),
            ...(mapped.Host ? { '#H': 'Host' } : {}),
            '#E': 'EntityType',
        }
        const ExpressionAttributeValues = {
            ...(mapped.Name ? { ':n': mapped.Name } : {}),
            ...(mapped.Host ? { ':h': mapped.Host } : {}),
            ':e': this.entityType,
        }
        return await dynamoDb
            .update({
                TableName,
                Key,
                UpdateExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
            })
            .promise()
    }

    async put(args: PutPlayer | PutPlayer[]): Promise<any> {
        return Array.isArray(args)
            ? putMany({
                  Items: args.map(this.toDynamo),
                  TableName,
              })
            : put({
                  Item: this.toDynamo(args),
                  TableName,
              })
    }

    private readonly toDynamo = (player: PutPlayer): PlayerModel =>
        ({
            EntityType: this.entityType,
            PK: `g#${player.gameId}`,
            SK: `p#${player.id}`,
            Name: player.nickname,
            Host: player.host,
        } as PlayerModel)

    private readonly fromDynamo = (result: any): IPlayer => ({
        id: result.SK.replace('p#', ''),
        nickname: result.Name,
        host: result.Host ?? false,
    })
}

class StateClient {
    private entityType = 'state'

    async get<T>(gameId: GameId): Promise<T> {
        return dynamoDb
            .get({
                TableName,
                Key: {
                    PK: `g#${gameId}`,
                    SK: this.entityType,
                },
            })
            .promise()
            .then((result) =>
                result.Item ? this.fromDynamo(result.Item) : undefined
            )
            .then((result) => result as T)
    }

    async list<T>(ids: GameId[]): Promise<T[]> {
        return await dynamoDb
            .query({
                TableName,
                KeyConditions: {
                    PK: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: ids.map((id) => `g#${id}`),
                    },
                    SK: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [this.entityType],
                    },
                },
                Limit: ids.length,
            })
            .promise()
            .then((results) =>
                results.Items
                    ? results.Items.map((i) => this.fromDynamo<T>(i))
                    : []
            )
    }

    async put<T>(gameId: GameId, state: T): Promise<any> {
        return put({
            Item: this.toDynamo(gameId, state),
            TableName,
        })
    }

    async delete(gameId: GameId): Promise<any> {
        return await dynamoDb
            .delete({
                TableName,
                Key: {
                    PK: `g#${gameId}`,
                    SK: this.entityType,
                },
            })
            .promise()
    }

    private readonly toDynamo = (gameId: GameId, state: any): StateModel =>
        ({
            EntityType: this.entityType,
            PK: `g#${gameId}`,
            SK: this.entityType,
            State: state,
        } as StateModel)

    private readonly fromDynamo = <T>(result: any): any => result.State as T
}

export default {
    games: new GamesClient(),
    players: new PlayersClient(),
    state: new StateClient(),
}

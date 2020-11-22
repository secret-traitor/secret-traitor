import dynamoDb from '@clients/dynamo'
import { GameId, GameStatus, GameType, IGame } from '@entities/Game'
import { IPlayer, PlayerId } from '@entities/Player'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

type Item = { [key: string]: any }

type PutArgs = {
    client: DocumentClient
    Item: Item
    TableName: string
}

const put = async ({ client, Item, TableName }: PutArgs) =>
    await client.put({ TableName, Item }).promise()

type PutManyArgs = {
    client: DocumentClient
    Items: Item[]
    TableName: string
}

const putMany = async ({ client, Items, TableName }: PutManyArgs) =>
    await client
        .batchWrite({
            RequestItems: {
                [TableName]: Items.map((Item) => ({
                    PutRequest: { Item },
                })),
            },
        })
        .promise()

type FindArgs = {
    client: DocumentClient
    EntityType: string
    ScanFilter: { [key: string]: Condition }
    TableName: string
}

const find = async ({ client, EntityType, ScanFilter, TableName }: FindArgs) =>
    await client
        .scan({
            TableName,
            ScanFilter: {
                ...ScanFilter,
                EntityType: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [EntityType],
                },
            },
        })
        .promise()

interface IGamesClient {
    create(type: GameType): Promise<IGame>
    get(id: GameId): Promise<IGame | undefined>
    list(ids: GameId[]): Promise<IGame[]>
    put(game: IGame): Promise<any>
}

type ComparisonOperator =
    | 'EQ'
    | 'NE'
    | 'IN'
    | 'LE'
    | 'LT'
    | 'GE'
    | 'GT'
    | 'BETWEEN'
    | 'NOT_NULL'
    | 'NULL'
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'BEGINS_WITH'

type Condition = {
    AttributeValueList?: any
    ComparisonOperator: ComparisonOperator
}

class GamesClient implements IGamesClient {
    private client = dynamoDb
    private entityType = 'game'
    private tableName = 'Games'

    async create(type: GameType): Promise<IGame> {
        const game: IGame = {
            status: GameStatus.InLobby,
            type,
            id: this.makeCode(),
        }
        await this.put(game)
        return game
    }

    async find(filter: { [key: string]: Condition }): Promise<IGame[]> {
        const result = await find({
            ScanFilter: filter,
            EntityType: this.entityType,
            client: this.client,
            TableName: this.tableName,
        })
        return result.Items?.map(this.fromDynamo) ?? []
    }

    async get(id: GameId): Promise<IGame | undefined> {
        return this.client
            .get({
                TableName: this.tableName,
                Key: {
                    PK: `g#${id}`,
                    SK: `g#${id}`,
                },
            })
            .promise()
            .then((result) =>
                result.Item ? this.fromDynamo(result.Item) : undefined
            )
    }

    async list(ids: GameId[]): Promise<IGame[]> {
        const AttributeValueList = ids.map((id) => `g#${id}`)
        return await this.client
            .query({
                TableName: this.tableName,
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
            })
            .promise()
            .then((results) =>
                results.Items ? results.Items.map(this.fromDynamo) : []
            )
    }

    async put(args: IGame | IGame[]): Promise<any> {
        return Array.isArray(args)
            ? putMany({
                  client: this.client,
                  Items: args.map(this.toDynamo),
                  TableName: this.tableName,
              })
            : put({
                  client: this.client,
                  Item: this.toDynamo(args),
                  TableName: this.tableName,
              })
    }

    private readonly toDynamo = (game: IGame) => ({
        EntityType: this.entityType,
        PK: `g#${game.id.toLowerCase()}`,
        SK: `g#${game.id.toLowerCase()}`,
        Status: game.status,
        Type: game.type,
    })

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

type PutPlayer = IPlayer & {
    gameId: GameId
}

interface IPlayersClient {
    create(
        gameId: GameId,
        playerId: PlayerId,
        host?: boolean,
        nickname?: string
    ): Promise<IPlayer>
    get(gameId: GameId, playerId: PlayerId): Promise<IPlayer | undefined>
    list(gameId: GameId): Promise<IPlayer[]>
    put(args: PutPlayer | PutPlayer[]): Promise<any>
}

class PlayersClient implements IPlayersClient {
    private client = dynamoDb
    private entityType = 'player'
    private tableName = 'Games'

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

    async find(filter: { [key: string]: Condition }): Promise<IPlayer[]> {
        const result = await find({
            ScanFilter: filter,
            EntityType: this.entityType,
            client: this.client,
            TableName: this.tableName,
        })
        return result.Items?.map(this.fromDynamo) ?? []
    }

    async get(
        gameId: GameId,
        playerId: PlayerId
    ): Promise<IPlayer | undefined> {
        return this.client
            .get({
                TableName: this.tableName,
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
        return await this.client
            .query({
                TableName: this.tableName,
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

    async put(args: PutPlayer | PutPlayer[]): Promise<any> {
        return Array.isArray(args)
            ? putMany({
                  client: this.client,
                  Items: args.map(this.toDynamo),
                  TableName: this.tableName,
              })
            : put({
                  client: this.client,
                  Item: this.toDynamo(args),
                  TableName: this.tableName,
              })
    }

    private readonly toDynamo = (player: PutPlayer) => ({
        EntityType: this.entityType,
        PK: `g#${player.gameId}`,
        SK: `p#${player.id}`,
        Name: player.nickname,
        Host: player.host,
    })

    private readonly fromDynamo = (result: any): IPlayer => ({
        id: result.SK.replace('p#', ''),
        nickname: result.Name,
        host: result.Host ?? false,
    })
}

interface IStateClient {
    get<T>(gameId: GameId): Promise<T>
    put(gameId: GameId, state: any): Promise<any>
}

class StateClient implements IStateClient {
    private client = dynamoDb
    private tableName = 'Games'

    async get<T>(gameId: GameId): Promise<T> {
        return this.client
            .get({
                TableName: this.tableName,
                Key: {
                    PK: `g#${gameId}`,
                    SK: 'state',
                },
            })
            .promise()
            .then((result) =>
                result.Item ? this.fromDynamo(result.Item) : undefined
            )
            .then((result) => result as T)
    }

    async list<T>(ids: GameId[]): Promise<T[]> {
        return await this.client
            .query({
                TableName: this.tableName,
                KeyConditions: {
                    PK: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: ids.map((id) => `g#${id}`),
                    },
                    SK: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: ['state'],
                    },
                },
            })
            .promise()
            .then((results) =>
                results.Items
                    ? results.Items.map((i) => this.fromDynamo<T>(i))
                    : []
            )
    }

    async put(gameId: GameId, state: any): Promise<any> {
        return put({
            client: this.client,
            Item: this.toDynamo(gameId, state),
            TableName: this.tableName,
        })
    }

    async delete(gameId: GameId): Promise<any> {
        return await this.client
            .delete({
                TableName: this.tableName,
                Key: {
                    PK: `g#${gameId}`,
                    SK: 'state',
                },
            })
            .promise()
    }

    private readonly toDynamo = (gameId: GameId, state: any) => ({
        EntityType: 'state',
        PK: `g#${gameId}`,
        SK: `state`,
        State: state,
    })

    private readonly fromDynamo = <T>(result: any): any => result.State as T
}

export default {
    games: new GamesClient(),
    players: new PlayersClient(),
    state: new StateClient(),
}

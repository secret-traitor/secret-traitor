import dynamoDb, {
    Condition,
    scan,
    put,
    putMany,
    waitForTable as waitFor,
} from 'src/clients/dynamoDb'
import { GameId, GameStatus, GameType, IGame } from 'src/entities/Game'
import { IPlayer, PlayerId } from 'src/entities/Player'

const TableName = 'Games'
export const waitForTable = async () => waitFor(TableName)

interface IGamesClient {
    create(type: GameType): Promise<IGame>
    get(id: GameId): Promise<IGame | undefined>
    list(ids: GameId[]): Promise<IGame[]>
    put(game: IGame): Promise<any>
    scan(filter: { [key: string]: Condition }): Promise<IGame[]>
}

type NoUndefinedField<T> = {
    [P in keyof T]-?: Exclude<T[P], null | undefined>
}

class GamesClient implements IGamesClient {
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

    async put(args: IGame | IGame[], update?: boolean): Promise<any> {
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

    private readonly toDynamo = (game: IGame) => ({
        EntityType: this.entityType,
        PK: `g#${game.id.toLowerCase()}`,
        SK: `g#${game.id.toLowerCase()}`,
        Status: game.status,
        Type: game.type,
    })

    private readonly fromDynamo = (result: any): IGame =>
        ({
            id: result.PK.replace('g#', '').toLowerCase(),
            status: result.Status,
            type: result.Type,
        } as NoUndefinedField<IGame>)

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

type PutPlayer = Partial<Omit<IPlayer, 'id'>> & {
    id: PlayerId
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
    put(args: PutPlayer | PutPlayer[], update?: boolean): Promise<any>
    list(gameId: GameId): Promise<IPlayer[]>
    scan(filter: { [key: string]: Condition }): Promise<IPlayer[]>
}

class PlayersClient implements IPlayersClient {
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

    private readonly toDynamo = (player: PutPlayer) =>
        ({
            EntityType: this.entityType,
            PK: `g#${player.gameId}`,
            SK: `p#${player.id}`,
            Name: player.nickname,
            Host: player.host,
        } as NoUndefinedField<any>)

    private readonly fromDynamo = (result: any): IPlayer => ({
        id: result.SK.replace('p#', ''),
        nickname: result.Name,
        host: result.Host ?? false,
    })
}

interface IStateClient {
    get<T = any>(gameId: GameId): Promise<T>
    put<T = any>(gameId: GameId, state: T): Promise<any>
}

class StateClient implements IStateClient {
    private client = dynamoDb

    async get<T>(gameId: GameId): Promise<T> {
        return this.client
            .get({
                TableName,
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
                TableName,
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
        return await this.client
            .delete({
                TableName,
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

    private readonly toDynamo2 = (gameId: GameId, state: any) => ({
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

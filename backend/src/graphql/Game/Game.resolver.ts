import {
    Arg,
    Ctx,
    FieldResolver,
    ID,
    Query,
    Resolver,
    Root,
} from 'type-graphql'

import { GameId, GameStatus, IGame, IGameDescription } from 'src/entities/Game'
import { IPlayer, PlayerId } from 'src/entities/Player'
import { GameState, IGameState } from 'src/graphql/GameState'
import { Player } from 'src/graphql/Player'

import { Game, GameDescription, GameDescriptions } from './Game.types'
import Context from 'src/shared/Context'
import { ApiResponse, DescriptiveError } from 'src/shared/api'

@Resolver(() => Game)
export class GameResolver {
    @FieldResolver(() => [Player])
    async players(
        @Root() game: IGame,
        @Ctx() { dataSources: { players } }: Context
    ): Promise<IPlayer[]> {
        return await players.list(game.id)
    }

    @FieldResolver(() => GameState, { nullable: true })
    async state(
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Root() game: IGame,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ApiResponse<IGameState | null>> {
        return (await alliesAndEnemies.exists(game.id))
            ? {
                  gameId: game.id,
                  gameType: game.type,
                  viewingPlayerId,
              }
            : null
    }

    @FieldResolver(() => Player, { nullable: true })
    async player(
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Root() { id: gameId }: IGame,
        @Ctx() { dataSources: { players } }: Context
    ): Promise<IPlayer | undefined> {
        return await players.get(gameId, playerId)
    }

    @Query(() => Game, { nullable: true })
    async game(
        @Arg('id', () => ID) id: GameId,
        @Ctx() { dataSources: { games } }: Context
    ): Promise<IGame | undefined> {
        return await games.load(id)
    }

    @Query(() => [Game])
    async joinableGames(
        @Ctx() { dataSources: { games } }: Context
    ): Promise<IGame[]> {
        return games.scan({
            Status: {
                AttributeValueList: [GameStatus.InLobby, GameStatus.InProgress],
                ComparisonOperator: 'IN',
            },
        })
    }

    @Query(() => [GameDescription])
    gameTypes(): IGameDescription[] {
        return GameDescriptions
    }
}

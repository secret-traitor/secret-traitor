import {
    Arg,
    Ctx,
    FieldResolver,
    ID,
    Query,
    Resolver,
    Root,
} from 'type-graphql'

import GamesClient from '@clients/Games'
import { GameId, GameStatus, IGame, IGameDescription } from '@entities/Game'
import { IPlayer, PlayerId } from '@entities/Player'
import { GameState, IGameState } from '@graphql/GameState'
import { Player } from '@graphql/Player'

import { Game, GameDescription, GameDescriptions } from './Game.types'
import Context from '@shared/Context'

@Resolver(() => Game)
export class GameResolver {
    @FieldResolver(() => [Player], { name: 'players' })
    async players(@Root() game: IGame): Promise<IPlayer[]> {
        return GamesClient.players.list(game.id)
    }

    @FieldResolver(() => GameState, { nullable: true })
    async state(
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Root() game: IGame,
        @Ctx() { dataSources: { games } }: Context
    ): Promise<IGameState | null> {
        const state = await games.get(game.id)
        return state
            ? ({
                  gameId: game.id,
                  gameType: game.type,
                  playerId,
              } as IGameState)
            : null
    }

    @Query(() => Player, { nullable: true })
    async player(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId
    ): Promise<IPlayer | null> {
        return (await GamesClient.players.get(gameId, playerId)) ?? null
    }

    @Query(() => Game, { nullable: true })
    async game(
        @Arg('id', () => ID) id: GameId,
        @Ctx() { dataSources: { games } }: Context
    ): Promise<IGame | null> {
        return (await games.get(id)) ?? null
    }

    @Query(() => [Game])
    async joinableGames(): Promise<IGame[]> {
        return GamesClient.games.find({
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

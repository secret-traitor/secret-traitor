import { Arg, Ctx, ID, Mutation, Resolver } from 'type-graphql'

import { GameType, IGame } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { Game } from '@graphql/Game/Game.types'
import { ApiResponse } from '@shared/api'
import Context from '@shared/Context'

@Resolver(() => Game)
export class DeleteGameResolver {
    @Mutation(() => Game, { nullable: true })
    async createGame(
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('gameType', () => GameType) gameType: GameType,
        @Ctx() { dataSources: { games, players } }: Context
    ): Promise<ApiResponse<IGame | null>> {
        const game = await games.create(gameType)
        await players.create(game.id, playerId, true)

        // ---- SEED PLAYERS ----
        await players.create(game.id, 'aaa', true, 'Arnold')
        await players.create(game.id, 'bbb', false, 'Bonnie')
        await players.create(game.id, 'ccc', false, 'Charles')
        await players.create(game.id, 'ddd', false, 'David')
        await players.create(game.id, 'eee', false, 'Emily')
        await players.create(game.id, 'fff', false, 'Frankie')
        // TODO: Remove seeding players

        return game
    }
}

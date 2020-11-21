import { Arg, ID, Mutation, Resolver } from 'type-graphql'

import GamesClient from '@clients/Games'
import { GameId, GameType, IGame } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { Game } from '@graphql/Game/Game.types'
import { ApiResponse } from '@shared/api'

@Resolver(() => Game)
export class DeleteGameResolver {
    @Mutation(() => Game, { nullable: true })
    async createGame(
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('gameType', () => GameType) gameType: GameType
    ): Promise<ApiResponse<IGame | null>> {
        const game = await GamesClient.games.create(gameType)
        await GamesClient.players.create(game.id, playerId, true)
        await this.seedPlayers(game.id) // TODO: remove me!
        return game
    }

    private async seedPlayers(gameId: GameId) {
        await GamesClient.players.create(gameId, 'aaa', true, 'Arnold')
        await GamesClient.players.create(gameId, 'bbb', false, 'Bonnie')
        await GamesClient.players.create(gameId, 'ccc', false, 'Charles')
        await GamesClient.players.create(gameId, 'ddd', false, 'David')
        await GamesClient.players.create(gameId, 'eee', false, 'Emily')
        await GamesClient.players.create(gameId, 'fff', false, 'Frankie')
    }
}

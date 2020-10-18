import { Arg, Mutation, Resolver } from 'type-graphql'
import { Game } from '@graphql/Game/Game.types'
import { Inject } from 'typedi'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { ApiResponse, UnexpectedApiError } from '@shared/api'
import { GameType, IGame } from '@entities/Game'

@Resolver(() => Game)
export class DeleteGameResolver {
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao,
        @Inject('Players') private readonly playerDao: IPlayerDao
    ) {}

    @Mutation(() => Game, { nullable: true })
    async createGame(
        @Arg('playerCode') playerCode: string,
        @Arg('gameType', () => GameType) gameType: GameType
    ): Promise<ApiResponse<IGame | null>> {
        const player = await this.playerDao.new({ code: playerCode })
        if (!player) {
            return new UnexpectedApiError('Unable to create new player.')
        }
        const game = await this.gameDao.new({ type: gameType })
        if (!game) {
            return new UnexpectedApiError('Unable to create new game.')
        }
        await this.gamePlayerDao.new({
            gameId: game.id,
            playerId: player.id,
            host: true,
        })
        return game
    }
}

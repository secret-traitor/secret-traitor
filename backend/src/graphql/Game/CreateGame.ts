import { Arg, ID, Mutation, Resolver } from 'type-graphql'
import { Game } from '@graphql/Game/Game.types'
import { Inject } from 'typedi'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { ApiResponse, UnexpectedError } from '@shared/api'
import { GameId, GameType, IGame } from '@entities/Game'
import { PlayerId } from '@entities/Player'

@Resolver(() => Game)
export class DeleteGameResolver {
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao,
        @Inject('Players') private readonly playerDao: IPlayerDao
    ) {}

    @Mutation(() => Game, { nullable: true })
    async createGame(
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('gameType', () => GameType) gameType: GameType
    ): Promise<ApiResponse<IGame | null>> {
        const player = await this.playerDao.put({ id: playerId })
        const game = await this.gameDao.new({ type: gameType })
        await this.gamePlayerDao.new({
            gameId: game.id,
            playerId: player.id,
            host: true,
        })

        // TODO: remove me!
        await this.seedPlayers(game.id)

        return game
    }

    private async seedPlayers(gameId: GameId) {
        const seed = async (
            id: string,
            nickname: string,
            host: boolean = false
        ) => {
            const player = await this.playerDao.put({
                id,
                nickname,
            })
            await this.gamePlayerDao.new({
                gameId,
                playerId: player.id,
                host,
            })
        }
        await seed('aaa', 'Arnold', true)
        await seed('bbb', 'Bonnie')
        await seed('ccc', 'Charles')
        await seed('ddd', 'David')
        await seed('eee', 'Emily')
        await seed('fff', 'Frankie')
    }
}

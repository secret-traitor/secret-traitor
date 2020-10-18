import { Arg, Mutation, Resolver } from 'type-graphql'
import { Game } from '@graphql/Game/Game.types'
import { Inject } from 'typedi'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { ApiResponse } from '@shared/api'

@Resolver(() => Game)
export class DeleteGameResolver {
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao,
        @Inject('Players') private readonly playerDao: IPlayerDao
    ) {}

    @Mutation(() => Boolean)
    async deleteGame(
        @Arg('id', () => Boolean) id: string
    ): Promise<ApiResponse<boolean>> {
        return (await this.gameDao.delete({ id })) || false
    }
}

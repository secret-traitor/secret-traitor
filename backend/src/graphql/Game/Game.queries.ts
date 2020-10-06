import head from 'lodash/head'
import { Arg, Query, Resolver } from 'type-graphql'
import { Inject } from 'typedi'

import { GraphQlPromiseResponse } from '@shared/graphql'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { GameStatus, IGame, IGameDescription } from '@entities/Game'
import { Game, GameDescription, GameDescriptions } from '@graphql/Game'

@Resolver()
export class GameQueries {
    @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao
    @Inject('Games') private readonly gameDao: IGameDao
    @Inject('Players') private readonly playerDao: IPlayerDao

    constructor(
        gamePlayerDao: IGamePlayerDao,
        gameDao: IGameDao,
        playerDao: IPlayerDao
    ) {
        this.gamePlayerDao = gamePlayerDao
        this.gameDao = gameDao
        this.playerDao = playerDao
    }

    @Query(() => Game, { nullable: true })
    async game(
        @Arg('code', () => String) code: string
    ): GraphQlPromiseResponse<IGame | null> {
        return (
            head(await this.gameDao.find({ code: code.toLowerCase() })) || null
        )
    }

    @Query(() => [Game])
    async allGames(): GraphQlPromiseResponse<IGame[]> {
        return (await this.gameDao.all({})) || []
    }

    @Query(() => [Game])
    async joinableGames(): GraphQlPromiseResponse<IGame[]> {
        return (await this.gameDao.find({ status: GameStatus.InLobby })) || []
    }

    @Query(() => [GameDescription])
    async gameTypes(): GraphQlPromiseResponse<IGameDescription[]> {
        return GameDescriptions
    }
}

import head from 'lodash/head'
import { Arg, Query, Resolver } from 'type-graphql'
import { Inject } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { IGamePlayer } from '@entities/GamePlayer'
import { GamePlayer } from '@graphql/GamePlayer'
import { ApiResponse } from '@shared/api'

@Resolver()
export class GamePlayerQueries {
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

    @Query(() => GamePlayer, { nullable: true })
    async gamePlayer(
        @Arg('gameCode', () => String) gameCode: string,
        @Arg('playerCode', () => String) playerCode: string
    ): Promise<ApiResponse<IGamePlayer | null>> {
        const game = head(
            await this.gameDao.find({ code: gameCode.toLowerCase() })
        )
        if (!game) return null
        const player = head(await this.playerDao.find({ code: playerCode }))
        if (!player) return null
        const gamePlayer = head(
            await this.gamePlayerDao.find({
                playerId: player.id,
                gameId: game.id,
            })
        )
        if (!gamePlayer) return null
        return gamePlayer
    }
}

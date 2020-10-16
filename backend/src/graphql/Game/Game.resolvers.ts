import { FieldResolver, Resolver, Root } from 'type-graphql'
import map from 'lodash/map'
import { Inject } from 'typedi'

import { ApiResponse, UnexpectedApiError } from '@shared/api'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { IPlayer } from '@entities/Player'
import { Player } from '@graphql/Player'

import { Game } from './Game.types'
import { IGame } from '@entities/Game'
import { IGameDao } from '@daos/Game'

@Resolver(() => Game)
export class GameResolver {
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

    @FieldResolver(() => [Player])
    async hosts(@Root() game: IGame): Promise<ApiResponse<IPlayer[]>> {
        const gamePlayers = await this.gamePlayerDao.find({
            gameId: game.id,
            host: true,
        })
        if (!gamePlayers) {
            return new UnexpectedApiError(
                'Unable to look up host players.',
                'No players have joined this game.'
            )
        }
        const playerIds = map(gamePlayers, (gp) => gp.playerId)
        return await this.playerDao.list({ ids: playerIds })
    }

    @FieldResolver(() => [Player], { name: 'players' })
    async players(@Root() game: IGame): Promise<ApiResponse<IPlayer[]>> {
        const gamePlayers = await this.gamePlayerDao.find({ gameId: game.id })
        const playerIds = map(gamePlayers, (gp) => gp.playerId)
        return await this.playerDao.list({ ids: playerIds })
    }
}

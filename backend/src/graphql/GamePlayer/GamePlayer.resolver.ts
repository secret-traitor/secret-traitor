import { FieldResolver, Resolver, Root } from 'type-graphql'
import { Inject } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { Game } from '@graphql/Game'
import { GamePlayer } from '@graphql/GamePlayer'
import { Player } from '@graphql/Player'

import { IGame } from '@entities/Game'
import { IGamePlayer } from '@entities/GamePlayer'
import { IPlayer } from '@entities/Player'

import { ApiResponse, UnexpectedApiError } from '@shared/api'

@Resolver(() => GamePlayer)
export class GamePlayerResolver {
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

    @FieldResolver(() => Player)
    async player(
        @Root() gamePlayer: IGamePlayer
    ): Promise<ApiResponse<IPlayer>> {
        const player = await this.playerDao.get({ id: gamePlayer.playerId })
        if (!player) {
            return new UnexpectedApiError(
                'Unable to look up player.',
                'No player with this id found.'
            )
        }
        return player
    }

    @FieldResolver(() => Game)
    async game(@Root() gamePlayer: IGamePlayer): Promise<ApiResponse<IGame>> {
        const game = await this.gameDao.get({ id: gamePlayer.gameId })
        if (!game) {
            return new UnexpectedApiError(
                'Unable to look up game.',
                'No game with this id found.'
            )
        }
        return game
    }
}

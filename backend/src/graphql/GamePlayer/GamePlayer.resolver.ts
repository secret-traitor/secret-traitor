import { Arg, FieldResolver, Query, Resolver, Root } from 'type-graphql'
import { Inject } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { Game } from '@graphql/Game'
import { GamePlayer } from '@graphql/GamePlayer'
import { Player } from '@graphql/Player'

import { GameId, IGame } from '@entities/Game'
import { IGamePlayer } from '@entities/GamePlayer'
import { IPlayer, PlayerId } from '@entities/Player'

import { ApiResponse, UnexpectedError } from '@shared/api'
import head from 'lodash/head'

@Resolver(() => GamePlayer)
export class GamePlayerResolver {
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao,
        @Inject('Players') private readonly playerDao: IPlayerDao
    ) {}

    @FieldResolver(() => Player)
    async player(
        @Root() gamePlayer: IGamePlayer
    ): Promise<ApiResponse<IPlayer>> {
        const player = await this.playerDao.get({ id: gamePlayer.playerId })
        if (!player) {
            return new UnexpectedError(
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
            return new UnexpectedError(
                'Unable to look up game.',
                'No game with this id found.'
            )
        }
        return game
    }

    @Query(() => GamePlayer, { nullable: true })
    async gamePlayer(
        @Arg('gameId', () => String) gameId: GameId,
        @Arg('playerId', () => String) playerId: PlayerId
    ): Promise<ApiResponse<IGamePlayer | null>> {
        const game = head(await this.gameDao.find({ id: gameId.toLowerCase() }))
        if (!game) return null
        const player = head(await this.playerDao.find({ id: playerId }))
        if (!player) return null
        const gamePlayers = await this.gamePlayerDao.find({
            playerId: player.id,
            gameId: game.id,
        })
        const gamePlayer = head(gamePlayers)
        if (!gamePlayer) return null
        return gamePlayer
    }
}

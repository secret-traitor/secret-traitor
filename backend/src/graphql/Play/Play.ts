import { Arg, ID, Query, Resolver, Root, Subscription } from 'type-graphql'
import { Inject, Service } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { GameId, IGame } from '@entities/Game'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { PlayerId, IPlayer } from '@entities/Player'

import { Event } from '@graphql/Event'
import { GameState, IGameState } from '@graphql/GameState'
import { GameStateEvent, IGameStateEvent } from '@graphql/GameStateEvent'

import logger from '@shared/Logger'
import { ApiError, ApiResponse, UnexpectedApiError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@Resolver(() => Event)
export class PlayResolver {
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

    private async getGamePlayer(id: GamePlayerId): Promise<IGamePlayer> {
        const gamePlayer = await this.gamePlayerDao.get({ id })
        if (!gamePlayer) {
            throw new ApiError(
                'Unable to look up player for this game.',
                'No game and player with this id found.'
            )
        }
        return gamePlayer
    }

    private async getPlayer(id: PlayerId): Promise<IPlayer> {
        const player = await this.playerDao.get({ id })
        if (!player) {
            throw new ApiError(
                'Unable to look up player.',
                'No game with this player found.'
            )
        }
        return player
    }

    private async getGame(id: GameId): Promise<IGame> {
        const game = await this.gameDao.get({ id })
        if (!game) {
            throw new ApiError(
                'Unable to look up game.',
                'No game with this code found.'
            )
        }
        return game
    }

    @Query(() => GameState, { nullable: true, name: 'play' })
    async playQuery(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId
    ): Promise<ApiResponse<IGameState>> {
        try {
            const gamePlayer = await this.getGamePlayer(gamePlayerId)
            const game = await this.getGame(gamePlayer.gameId)
            return {
                gamePlayerId: gamePlayer.id,
                gameType: game.type,
            }
        } catch (e) {
            if (e instanceof UnexpectedApiError) {
                return e
            }
            throw e
        }
    }

    @Subscription(() => GameStateEvent, {
        topics: ({ args }) => getTopicName(Topics.Play, args.gameId),
        name: 'play',
        nullable: true,
    })
    playSubscription(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Arg('gameId', () => ID) gameId: GameId,
        @Root() event: IGameStateEvent
    ): IGameStateEvent {
        logger.debug(
            'Subscription Event: ' +
                JSON.stringify({
                    args: { gamePlayerId, gameId },
                    event,
                    topic: getTopicName(Topics.Play, gameId),
                })
        )
        return { ...event, gameId, gamePlayerId } as IGameStateEvent
    }
}

import {
    Arg,
    Field,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'
import head from 'lodash/head'
import { Inject } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { GameStatus, IGame } from '@entities/Game'
import { Event } from '@graphql/Event'
import { GameStateEvent, IGameStateEvent } from '@graphql/GameStateEvent'
import { ApiError, ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import { IGamePlayer } from '@entities/GamePlayer'

export type IJoinGameEvent = GameStateEvent

@ObjectType({ implements: [Event, GameStateEvent] })
export class JoinGameEvent
    extends GameStateEvent
    implements IJoinGameEvent, IGameStateEvent {
    constructor(gamePlayer: IGamePlayer, game: IGame) {
        super(gamePlayer.id, game.type, JoinGameEvent.name)
    }
}

@Resolver(() => JoinGameEvent)
export class JoinResolver {
    @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao
    @Inject('Games') private readonly gameDao: IGameDao
    @Inject('Players') private readonly playerDao: IPlayerDao

    constructor(
        gameDao: IGameDao,
        gamePlayerDao: IGamePlayerDao,
        playerDao: IPlayerDao
    ) {
        this.gameDao = gameDao
        this.gamePlayerDao = gamePlayerDao
        this.playerDao = playerDao
    }

    @Mutation(() => JoinGameEvent, { nullable: true })
    async joinGame(
        @Arg('gameCode', () => String) gameCode: string,
        @Arg('playerCode', () => String) playerCode: string,
        @Arg('playerNickname', () => String) playerNickname: string,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<IJoinGameEvent>> {
        const game = head(
            await this.gameDao.find({ code: gameCode.toLowerCase() })
        )
        if (!game) {
            return new ApiError(
                'Unable to look up game.',
                'No game with this code found.',
                'Please make sure a game exists before joining.'
            )
        }
        if (game.status !== GameStatus.InLobby) {
            return new ApiError(
                'Unable to join this game.',
                'Games are only joinable when they are in the lobby.',
                'Please join games from the home page or using recently copied links.'
            )
        }
        let player = head(await this.playerDao.find({ code: playerCode }))
        if (!player) {
            player = await this.playerDao.new({
                code: playerCode,
                nickname: playerNickname,
            })
        } else {
            player = await this.playerDao.put({
                ...player,
                nickname: playerNickname,
            })
        }
        let gamePlayer = head(
            await this.gamePlayerDao.find({
                gameId: game.id,
                playerId: player.id,
            })
        )
        if (!gamePlayer) {
            gamePlayer = await this.gamePlayerDao.new({
                gameId: game.id,
                playerId: player.id,
                host: false,
            })
        }
        const payload = new JoinGameEvent(gamePlayer, game)
        await pubSub.publish(getTopicName(Topics.Play, game.id), payload)
        return payload
    }
}

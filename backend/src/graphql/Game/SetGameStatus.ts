import {
    Arg,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'
import { Inject } from 'typedi'

import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'

import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { GameId, GameStatus, GameType, IGame } from '@entities/Game'

import { Event } from '@graphql/Event'
import { GameStateEvent, IGameStateEvent } from '@graphql/GameStateEvent'

import { ApiError, ApiResponse, UnexpectedApiError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import GameManager from '@games/GameManager'

type GameStateEventPayload = {
    gamePlayerId: GamePlayerId
    gameType: GameType
    newStatus: GameStatus
    oldStatus: GameStatus
}

export type IGameStatusEvent = GameStateEvent

@ObjectType({ implements: [Event, GameStateEvent] })
export class GameStatusEvent
    extends GameStateEvent
    implements IGameStatusEvent, IGameStateEvent {
    @Field(() => GameStatus, { name: 'new' })
    public readonly newStatus: GameStatus
    @Field(() => GameStatus, { name: 'old' })
    public readonly oldStatus: GameStatus

    constructor({
        gamePlayerId,
        gameType,
        newStatus,
        oldStatus,
    }: GameStateEventPayload) {
        super(gamePlayerId, gameType, GameStatusEvent.name)
        this.newStatus = newStatus
        this.oldStatus = oldStatus
    }
}

@Resolver()
export class SetGameStatusResolver {
    @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao
    @Inject('Games') private readonly gameDao: IGameDao

    constructor(gamePlayerDao: IGamePlayerDao, gameDao: IGameDao) {
        this.gamePlayerDao = gamePlayerDao
        this.gameDao = gameDao
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

    @Mutation(() => GameStatusEvent, { nullable: true })
    async setGameStatus(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Arg('status', () => GameStatus) status: GameStatus,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<IGameStatusEvent | null>> {
        try {
            const gamePlayer = await this.getGamePlayer(gamePlayerId)
            const oldGame = await this.getGame(gamePlayer.gameId)
            const newGame = await this.gameDao.put({ ...oldGame, status })

            const gameManager = new GameManager(newGame)
            if (
                oldGame.status === GameStatus.InLobby &&
                newGame.status === GameStatus.InProgress
            ) {
                const state = await gameManager.start({
                    gamePlayerId: gamePlayer.id,
                })
                if (!state) {
                    await this.gameDao.put(oldGame)
                    return new UnexpectedApiError('Something happened!')
                }
            }
            const payload = new GameStatusEvent({
                gamePlayerId,
                gameType: newGame.type,
                newStatus: newGame.status,
                oldStatus: oldGame.status,
            })
            await pubSub.publish(getTopicName(Topics.Play, newGame.id), payload)
            return payload
        } catch (e) {
            if (e instanceof UnexpectedApiError) {
                return e
            }
            throw e
        }
    }
}

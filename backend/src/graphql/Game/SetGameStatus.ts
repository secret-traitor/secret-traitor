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

import { Event, IEvent } from '@graphql/Event'
import { GameEvent, IGameEvent } from '@graphql/GameEvent'

import { ApiError, ApiResponse, UnexpectedApiError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import GameManager from '@games/GameManager'
import { IPlayer, PlayerId } from '@entities/Player'
import { IPlayerDao } from '@daos/Player'

type GameStateEvent = {
    gamePlayerId: GamePlayerId
    gameType: GameType
    newStatus: GameStatus
    oldStatus: GameStatus
    source: PlayerId
}

@ObjectType({ implements: [Event, GameEvent] })
export class GameStatusEvent extends GameEvent implements IEvent {
    @Field(() => GameStatus, { name: 'changedTo' })
    public readonly newStatus: GameStatus
    @Field(() => GameStatus, { name: 'changedFrom' })
    public readonly oldStatus: GameStatus

    constructor({
        gamePlayerId,
        gameType,
        source,
        newStatus,
        oldStatus,
    }: GameStateEvent) {
        const state = { gamePlayerId, gameType }
        super(state, source, GameStatusEvent.name)
        this.newStatus = newStatus
        this.oldStatus = oldStatus
    }
}

@Resolver()
export class SetGameStatusResolver {
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao
    ) {}

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
    ): Promise<ApiResponse<GameStatusEvent | null>> {
        try {
            const gamePlayer = await this.getGamePlayer(gamePlayerId)
            const oldGame = await this.getGame(gamePlayer.gameId)
            const newGame = await this.gameDao.put({ ...oldGame, status })

            const gameManager = new GameManager(newGame.id, newGame.type)
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
                source: gamePlayer.playerId,
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

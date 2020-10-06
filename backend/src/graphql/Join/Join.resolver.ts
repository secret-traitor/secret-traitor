import {
    Arg,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Query,
    Resolver,
    Root,
    Subscription,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'
import head from 'lodash/head'
import { Inject } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { GameId, GameStatus } from '@entities/Game'
import { GamePlayerId } from '@entities/GamePlayer'
import { PlayerId } from '@entities/Player'
import { Event } from '@graphql/Event'
import { PlayEvent } from '@graphql/PlayEvent'
import { getTopicName, Topics } from '@shared/topics'
import { GraphQLError, GraphQlPromiseResponse } from '@shared/graphql'

@ObjectType({ implements: [Event, PlayEvent] })
export class JoinGameEvent extends PlayEvent implements IJoinGameEvent {
    @Field(() => ID, { name: 'id' }) public gamePlayerId: GamePlayerId
    @Field(() => String) public source: string
    @Field(() => Date) public timestamp: Date
    public gameId: GameId
    public playerId: PlayerId

    constructor({ gameId, gamePlayerId, playerId }: IJoinGameEvent) {
        super('JoinGameEvent')
        this.gamePlayerId = gamePlayerId
        this.gameId = gameId
        this.playerId = playerId
        this.timestamp = new Date()
    }
}

export type IJoinGameEvent = {
    gameId: GameId
    gamePlayerId: GamePlayerId
    playerId: PlayerId
}

@Resolver(() => Event)
export class JoinResolver {
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

    @Mutation(() => JoinGameEvent, { nullable: true })
    async joinGame(
        @Arg('gameCode', () => String) gameCode: string,
        @Arg('playerCode', () => String) playerCode: string,
        @Arg('playerNickname', () => String) playerNickname: string,
        @PubSub() pubSub: PubSubEngine
    ): GraphQlPromiseResponse<IJoinGameEvent> {
        const game = head(
            await this.gameDao.find({ code: gameCode.toLowerCase() })
        )
        if (!game) {
            return new GraphQLError(
                'Unable to look up game.',
                'No game with this code found.',
                'Please make sure a game exists before joining.'
            )
        }
        if (game.status !== GameStatus.InLobby) {
            return new GraphQLError(
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
        const payload = new JoinGameEvent({
            playerId: player.id,
            gamePlayerId: gamePlayer.id,
            gameId: game.id,
        })
        const topic = getTopicName(Topics.Play, game.id)
        await pubSub.publish(topic, payload)
        console.log('published on: ' + topic, payload)
        return payload
    }

    @Query(() => PlayEvent, { nullable: true, name: 'play' })
    async playQuery(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId
    ): GraphQlPromiseResponse<PlayEvent | null> {
        const gamePlayer = head(
            await this.gamePlayerDao.find({ gameId, playerId })
        )
        if (!gamePlayer) {
            return new GraphQLError(
                'Unable to access player for this game.',
                'Player must have already joined this game to do this.',
                'Please join games from the home page or using recently copied links.'
            )
        }
        return new JoinGameEvent({
            gamePlayerId: gamePlayer?.id,
            gameId: gamePlayer?.gameId,
            playerId: gamePlayer?.playerId,
        })
    }

    @Subscription(() => PlayEvent, {
        topics: ({ args }) => {
            console.log('args: ' + JSON.stringify(args))
            const topic = getTopicName(Topics.Play, args.gameId)
            console.log('listening on: ' + topic)
            return topic
        },
        name: 'play',
    })
    async playSubscription(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Root() event: IJoinGameEvent
    ): GraphQlPromiseResponse<IJoinGameEvent> {
        return new JoinGameEvent(event)
    }
}

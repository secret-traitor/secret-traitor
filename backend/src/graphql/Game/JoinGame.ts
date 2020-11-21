import {
    Arg,
    FieldResolver,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
    Root,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import GamesClient from '@clients/Games'
import { GameStatus, GameId, IGame } from '@entities/Game'
import { Event } from '@graphql/Event'
import { GameEvent, IGameEvent } from '@graphql/GameEvent'
import { DescriptiveError, ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import { IPlayer, PlayerId } from '@entities/Player'
import { Player } from '@graphql/Player'

@ObjectType({ implements: [Event, GameEvent] })
export class JoinGameEvent extends GameEvent {
    constructor(game: IGame, playerId: PlayerId) {
        const state = { gameId: game.id, gameType: game.type, playerId }
        super(state, playerId, JoinGameEvent.name)
    }
}

@Resolver(() => JoinGameEvent)
class JoinResolver {
    @FieldResolver(() => Player, { nullable: true })
    async joined(
        @Root() { state: { gameId }, source }: IGameEvent
    ): Promise<IPlayer | null> {
        return (await GamesClient.players.get(gameId, source)) ?? null
    }

    @Mutation(() => JoinGameEvent)
    async joinGame(
        @Arg('gameId', () => String) gameId: GameId,
        @Arg('playerId', () => String) playerId: PlayerId,
        @Arg('playerNickname', () => String) nickname: string,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<JoinGameEvent>> {
        const game = await GamesClient.games.get(gameId)
        if (!game) {
            return new DescriptiveError(
                'Unable to look up game.',
                'No game with this code found.',
                'Please make sure a game exists before joining.'
            )
        }
        if (game.status !== GameStatus.InLobby) {
            return new DescriptiveError(
                'Unable to join this game.',
                'Games are only joinable when they are in the lobby.',
                'Please join games from the home page or using recently copied links.'
            )
        }
        const player = await GamesClient.players.put({
            gameId,
            id: playerId,
            nickname,
        })
        const payload = new JoinGameEvent(game, player)
        await pubSub.publish(getTopicName(Topics.Play, game.id), payload)
        return payload
    }
}

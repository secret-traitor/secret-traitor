import { Arg, ID, Mutation, ObjectType, PubSub, Resolver } from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import GamesClient from '@clients/Games'
import { GamePlayerId } from '@entities/GamePlayer'
import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesSecondHandDiscardEvent extends GameEvent {
    constructor(gameId: GamePlayerId, playerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesSecondHandDiscardEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesSecondHandDiscardEvent)
class AlliesAndEnemiesSecondHandDiscardEventResolver extends BaseAlliesAndEnemiesResolver {
    @Mutation(() => AlliesAndEnemiesSecondHandDiscardEvent)
    async alliesAndEnemiesSecondHandDiscard(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('index', () => Number) index: 0 | 1,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesSecondHandDiscardEvent>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
        const result = state.secondHand(index)
        if ('error' in result) {
            return result.error
        }
        await GamesClient.state.put(gameId, state)
        const payload = new AlliesAndEnemiesSecondHandDiscardEvent(
            gameId,
            playerId
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

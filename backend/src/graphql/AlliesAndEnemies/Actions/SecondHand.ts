import {
    Arg,
    Ctx,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import Context from '@shared/Context'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesSecondHandDiscardEvent extends GameEvent {
    constructor(gameId: GameId, viewingPlayerId: PlayerId) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(
            state,
            viewingPlayerId,
            AlliesAndEnemiesSecondHandDiscardEvent.name
        )
    }
}

@Resolver(() => AlliesAndEnemiesSecondHandDiscardEvent)
class AlliesAndEnemiesSecondHandDiscardEventResolver {
    @Mutation(() => AlliesAndEnemiesSecondHandDiscardEvent)
    async alliesAndEnemiesSecondHandDiscard(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Arg('index', () => Number) index: 0 | 1,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesSecondHandDiscardEvent>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.secondHand(index)
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesSecondHandDiscardEvent(
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

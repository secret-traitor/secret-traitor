import {
    Arg,
    Ctx,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Query,
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

import { Card } from './Card'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesPolicyPeekEvent extends GameEvent {
    constructor(gameId: GameId, playerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesPolicyPeekEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesPolicyPeekEvent)
class AlliesAndEnemiesPolicyPeekEventResolver {
    @Query(() => [Card])
    async alliesAndEnemiesPolicyPeek(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ApiResponse<[Card, Card, Card]>> {
        const state = await alliesAndEnemies.get(gameId, playerId)
        const result = state.policyPeek()
        if ('error' in result) {
            return result.error
        }
        return result.cards
    }

    @Mutation(() => AlliesAndEnemiesPolicyPeekEvent)
    async alliesAndEnemiesPolicyPeekOk(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesPolicyPeekEvent>> {
        const state = await alliesAndEnemies.get(gameId, playerId)
        const result = state.policyPeekOk()
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesPolicyPeekEvent(gameId, playerId)
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

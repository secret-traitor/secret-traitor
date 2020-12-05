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

import { GameId, GameType } from 'src/entities/Game'
import { PlayerId } from 'src/entities/Player'
import { Event } from 'src/graphql/Event'
import { GameEvent } from 'src/graphql/GameEvent'
import { ApiResponse } from 'src/shared/api'
import { getTopicName, Topics } from 'src/shared/topics'
import Context from 'src/shared/Context'

import { Card } from '../Card'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesPolicyPeekEvent extends GameEvent {
    constructor(gameId: GameId, viewingPlayerId: PlayerId) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(state, viewingPlayerId, AlliesAndEnemiesPolicyPeekEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesPolicyPeekEvent)
class AlliesAndEnemiesPolicyPeekEventResolver {
    @Query(() => [Card])
    async alliesAndEnemiesPolicyPeek(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ApiResponse<[Card, Card, Card]>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.policyPeek()
        if ('error' in result) {
            return result.error
        }
        return result.cards
    }

    @Mutation(() => AlliesAndEnemiesPolicyPeekEvent)
    async alliesAndEnemiesPolicyPeekOk(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesPolicyPeekEvent>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.policyPeekOk()
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesPolicyPeekEvent(
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

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

import { AlliesAndEnemiesPlayer } from './Player'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesInvestigateLoyaltyEvent extends GameEvent {
    constructor(gameId: GameId, playerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesInvestigateLoyaltyEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesInvestigateLoyaltyEvent)
class AlliesAndEnemiesInvestigateLoyaltyEventResolver {
    @Query(() => AlliesAndEnemiesPlayer, { nullable: true })
    async alliesAndEnemiesInvestigateLoyalty(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('investigatePlayerId', () => ID) investigatePlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ApiResponse<AlliesAndEnemiesPlayer | null>> {
        const state = await alliesAndEnemies.get(gameId, playerId)
        const result = state.investigateLoyalty(investigatePlayerId)
        if ('error' in result) {
            return result.error
        }
        return result.investigatedPlayer
    }

    @Mutation(() => AlliesAndEnemiesInvestigateLoyaltyEvent)
    async alliesAndEnemiesInvestigateLoyaltyOk(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesInvestigateLoyaltyEvent>> {
        const state = await alliesAndEnemies.get(gameId, playerId)
        const result = state.investigateLoyaltyOk()
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesInvestigateLoyaltyEvent(
            gameId,
            playerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

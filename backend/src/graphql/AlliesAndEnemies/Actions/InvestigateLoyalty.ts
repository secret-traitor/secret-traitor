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

import { AlliesAndEnemiesPlayer } from '../Player'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesInvestigateLoyaltyEvent extends GameEvent {
    constructor(gameId: GameId, viewingPlayerId: PlayerId) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(
            state,
            viewingPlayerId,
            AlliesAndEnemiesInvestigateLoyaltyEvent.name
        )
    }
}

@Resolver(() => AlliesAndEnemiesInvestigateLoyaltyEvent)
class AlliesAndEnemiesInvestigateLoyaltyEventResolver {
    @Query(() => AlliesAndEnemiesPlayer, { nullable: true })
    async alliesAndEnemiesInvestigateLoyalty(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Arg('investigatePlayerId', () => ID) investigatePlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ApiResponse<AlliesAndEnemiesPlayer | null>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.investigateLoyalty(investigatePlayerId)
        if ('error' in result) {
            return result.error
        }
        return result.investigatedPlayer
    }

    @Mutation(() => AlliesAndEnemiesInvestigateLoyaltyEvent)
    async alliesAndEnemiesInvestigateLoyaltyOk(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesInvestigateLoyaltyEvent>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.investigateLoyaltyOk()
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesInvestigateLoyaltyEvent(
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

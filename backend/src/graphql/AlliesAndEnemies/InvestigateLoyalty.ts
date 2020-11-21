import {
    Arg,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Query,
    Resolver,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import { GamePlayerId } from '@entities/GamePlayer'
import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

import { BaseAlliesAndEnemiesResolver } from './resolver'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesInvestigateLoyaltyEvent extends GameEvent {
    constructor(gameId: GamePlayerId, playerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesInvestigateLoyaltyEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesInvestigateLoyaltyEvent)
class AlliesAndEnemiesInvestigateLoyaltyEventResolver extends BaseAlliesAndEnemiesResolver {
    @Query(() => AlliesAndEnemiesPlayer, { nullable: true })
    async alliesAndEnemiesInvestigateLoyalty(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('investigatePlayerId', () => ID) investigatePlayerId: PlayerId
    ): Promise<ApiResponse<AlliesAndEnemiesPlayer | null>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
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
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesInvestigateLoyaltyEvent>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })

        const result = state.investigateLoyaltyOk()
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesInvestigateLoyaltyEvent(
            gameId,
            playerId
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

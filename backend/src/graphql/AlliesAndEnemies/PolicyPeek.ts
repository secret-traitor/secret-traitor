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

import GamesClient from '@clients/Games'
import { GamePlayerId } from '@entities/GamePlayer'
import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { Card } from '@graphql/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

import { BaseAlliesAndEnemiesResolver } from './resolver'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesPolicyPeekEvent extends GameEvent {
    constructor(gameId: GamePlayerId, playerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesPolicyPeekEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesPolicyPeekEvent)
class AlliesAndEnemiesPolicyPeekEventResolver extends BaseAlliesAndEnemiesResolver {
    @Query(() => [Card])
    async alliesAndEnemiesPolicyPeek(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId
    ): Promise<ApiResponse<[Card, Card, Card]>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
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
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesPolicyPeekEvent>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
        const result = state.policyPeekOk()
        if ('error' in result) {
            return result.error
        }
        await GamesClient.state.put(gameId, state)
        const payload = new AlliesAndEnemiesPolicyPeekEvent(gameId, playerId)
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

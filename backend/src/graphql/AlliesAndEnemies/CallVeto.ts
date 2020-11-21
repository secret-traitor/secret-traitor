import { Arg, ID, Mutation, ObjectType, PubSub, Resolver } from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import { GamePlayerId } from '@entities/GamePlayer'
import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesCallVetoEvent extends GameEvent {
    constructor(gameId: GamePlayerId, playerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesCallVetoEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesCallVetoEvent)
class AlliesAndEnemiesCallVetoEventResolver extends BaseAlliesAndEnemiesResolver {
    @Mutation(() => AlliesAndEnemiesCallVetoEvent)
    async alliesAndEnemiesCallVeto(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesCallVetoEvent>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
        const result = state.callVeto()
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesCallVetoEvent(gameId, playerId)
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

import { Arg, ID, Mutation, ObjectType, PubSub, Resolver } from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'
import { DescriptiveError, ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesFirstHandDiscardEvent extends GameEvent {
    constructor(gameId: GameId, playerId: PlayerId, activePlayerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, activePlayerId, AlliesAndEnemiesFirstHandDiscardEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesFirstHandDiscardEvent)
class AlliesAndEnemiesFirstHandDiscardEventResolver extends BaseAlliesAndEnemiesResolver {
    @Mutation(() => AlliesAndEnemiesFirstHandDiscardEvent)
    async alliesAndEnemiesFirstHandDiscard(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('index', () => Number) index: 0 | 1 | 2,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesFirstHandDiscardEvent>> {
        const {
            viewingPlayer,
            state,
        } = await this.getActiveViewingPlayerState({ gameId, playerId })
        if (viewingPlayer.position !== state.currentRound.position) {
            return new DescriptiveError(
                'Unable to play first hand.',
                'It is not your turn.',
                'Please refresh the page before trying again.'
            )
        }
        const result = state.firstHand(index)
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesFirstHandDiscardEvent(
            gameId,
            playerId,
            viewingPlayer.id
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

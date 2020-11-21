import {
    Arg,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import { GamePlayerId } from '@entities/GamePlayer'
import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { ViewingPlayerState } from '@games/AlliesAndEnemies'
import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

import { BaseAlliesAndEnemiesResolver } from './resolver'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesNominationEvent extends GameEvent {
    @Field(() => AlliesAndEnemiesPlayer)
    public readonly nomination: AlliesAndEnemiesPlayer

    constructor(
        nominatedPlayer: ViewingPlayerState,
        gameId: GamePlayerId,
        playerId: PlayerId
    ) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesNominationEvent.name)
        this.nomination = nominatedPlayer
    }
}

@Resolver(() => AlliesAndEnemiesNominationEvent)
class AlliesAndEnemiesNominationEventResolver extends BaseAlliesAndEnemiesResolver {
    @Mutation(() => AlliesAndEnemiesNominationEvent)
    async alliesAndEnemiesNominate(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('nominatedPlayerId', () => ID) nominatedPlayerId: PlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesNominationEvent>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
        const result = state.nominate(nominatedPlayerId)
        if ('error' in result) {
            return result.error
        }
        const nominatedPlayer = result.nominatedPlayer
        await state.save()
        const payload = new AlliesAndEnemiesNominationEvent(
            nominatedPlayer,
            gameId,
            playerId
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

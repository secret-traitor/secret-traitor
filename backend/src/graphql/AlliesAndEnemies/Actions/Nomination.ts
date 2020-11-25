import {
    Arg,
    Ctx,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { ViewingPlayerState } from '@entities/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import Context from '@shared/Context'

import { AlliesAndEnemiesPlayer } from '../Player'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesNominationEvent extends GameEvent {
    @Field(() => AlliesAndEnemiesPlayer)
    public readonly nomination: AlliesAndEnemiesPlayer

    constructor(
        nominatedPlayer: ViewingPlayerState,
        gameId: GameId,
        viewingPlayerId: PlayerId
    ) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(state, viewingPlayerId, AlliesAndEnemiesNominationEvent.name)
        this.nomination = nominatedPlayer
    }
}

@Resolver(() => AlliesAndEnemiesNominationEvent)
class AlliesAndEnemiesNominationEventResolver {
    @Mutation(() => AlliesAndEnemiesNominationEvent)
    async alliesAndEnemiesNominate(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Arg('nominatedPlayerId', () => ID) nominatedPlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesNominationEvent>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.nominate(nominatedPlayerId)
        if ('error' in result) {
            return result.error
        }
        const nominatedPlayer = result.nominatedPlayer
        await state.save()
        const payload = new AlliesAndEnemiesNominationEvent(
            nominatedPlayer,
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

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

import { AlliesAndEnemiesPlayer } from './Player'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesSpecialElectionEvent extends GameEvent {
    @Field(() => AlliesAndEnemiesPlayer)
    public readonly specialElectedPlayer: AlliesAndEnemiesPlayer

    constructor(
        specialElectedPlayer: ViewingPlayerState,
        gameId: GameId,
        playerId: PlayerId
    ) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesSpecialElectionEvent.name)
        this.specialElectedPlayer = specialElectedPlayer
    }
}

@Resolver(() => AlliesAndEnemiesSpecialElectionEvent)
class AlliesAndEnemiesSpecialElectionEventResolver {
    @Mutation(() => AlliesAndEnemiesSpecialElectionEvent)
    async alliesAndEnemiesSpecialElection(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('selectedPlayerId', () => ID) selectedPlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesSpecialElectionEvent>> {
        const state = await alliesAndEnemies.get(gameId, playerId)
        const result = state.specialElection(playerId)
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesSpecialElectionEvent(
            result.specialElectedPlayer,
            gameId,
            playerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

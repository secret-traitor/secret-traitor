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

import GamesClient from '@clients/Games'
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
export class AlliesAndEnemiesSpecialElectionEvent extends GameEvent {
    @Field(() => AlliesAndEnemiesPlayer)
    public readonly specialElectedPlayer: AlliesAndEnemiesPlayer

    constructor(
        specialElectedPlayer: ViewingPlayerState,
        gameId: GamePlayerId,
        playerId: PlayerId
    ) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesSpecialElectionEvent.name)
        this.specialElectedPlayer = specialElectedPlayer
    }
}

@Resolver(() => AlliesAndEnemiesSpecialElectionEvent)
class AlliesAndEnemiesSpecialElectionEventResolver extends BaseAlliesAndEnemiesResolver {
    @Mutation(() => AlliesAndEnemiesSpecialElectionEvent)
    async alliesAndEnemiesSpecialElection(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('selectedPlayerId', () => ID) selectedPlayerId: PlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesSpecialElectionEvent>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
        const result = state.specialElection(playerId)
        if ('error' in result) {
            return result.error
        }
        await GamesClient.state.put(gameId, state)
        const payload = new AlliesAndEnemiesSpecialElectionEvent(
            result.specialElectedPlayer,
            gameId,
            playerId
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

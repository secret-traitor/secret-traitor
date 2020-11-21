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
import { VoteValue } from '@games/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesVoteEvent extends GameEvent {
    @Field(() => VoteValue)
    public readonly vote: VoteValue

    constructor(vote: VoteValue, gameId: GamePlayerId, playerId: PlayerId) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesVoteEvent.name)
        this.vote = vote
    }
}

@Resolver(() => AlliesAndEnemiesVoteEvent)
class AlliesAndEnemiesVoteEventResolver extends BaseAlliesAndEnemiesResolver {
    @Mutation(() => AlliesAndEnemiesVoteEvent)
    async alliesAndEnemiesVote(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('vote', () => VoteValue) vote: VoteValue,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesVoteEvent>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
        const result = state.vote(vote)
        if ('error' in result) {
            return result.error
        }
        await GamesClient.state.put(gameId, state)
        const payload = new AlliesAndEnemiesVoteEvent(vote, gameId, playerId)
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

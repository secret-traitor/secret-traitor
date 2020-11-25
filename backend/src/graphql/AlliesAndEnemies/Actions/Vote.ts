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
import { VoteValue } from '@entities/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import Context from '@shared/Context'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesVoteEvent extends GameEvent {
    @Field(() => VoteValue)
    public readonly vote: VoteValue

    constructor(vote: VoteValue, gameId: GameId, viewingPlayerId: PlayerId) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(state, viewingPlayerId, AlliesAndEnemiesVoteEvent.name)
        this.vote = vote
    }
}

@Resolver(() => AlliesAndEnemiesVoteEvent)
class AlliesAndEnemiesVoteEventResolver {
    @Mutation(() => AlliesAndEnemiesVoteEvent)
    async alliesAndEnemiesVote(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Arg('vote', () => VoteValue) vote: VoteValue,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesVoteEvent>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.vote(vote)
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesVoteEvent(
            vote,
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

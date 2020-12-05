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

import { GameId, GameType } from 'src/entities/Game'
import { PlayerId } from 'src/entities/Player'
import { VoteValue } from 'src/entities/AlliesAndEnemies'
import { Event } from 'src/graphql/Event'
import { GameEvent } from 'src/graphql/GameEvent'
import { ApiResponse } from 'src/shared/api'
import { getTopicName, Topics } from 'src/shared/topics'
import Context from 'src/shared/Context'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesCallVetoEvent extends GameEvent {
    constructor(gameId: GameId, viewingPlayerId: PlayerId) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(state, viewingPlayerId, AlliesAndEnemiesCallVetoEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesCallVetoEvent)
class AlliesAndEnemiesCallVetoEventResolver {
    @Mutation(() => AlliesAndEnemiesCallVetoEvent)
    async alliesAndEnemiesCallVeto(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesCallVetoEvent>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.callVeto()
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesCallVetoEvent(
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesVetoVoteEvent extends GameEvent {
    @Field(() => VoteValue)
    public readonly vote: VoteValue

    constructor(vote: VoteValue, gameId: GameId, viewingPlayerId: PlayerId) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(state, viewingPlayerId, AlliesAndEnemiesVetoVoteEvent.name)
        this.vote = vote
    }
}

@Resolver(() => AlliesAndEnemiesVetoVoteEvent)
class AlliesAndEnemiesVetoVoteEventResolver {
    @Mutation(() => AlliesAndEnemiesVetoVoteEvent)
    async alliesAndEnemiesVetoVote(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Arg('vote', () => VoteValue) vote: VoteValue,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesVetoVoteEvent>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.vetoVote(vote)
        if ('error' in result) {
            return result.error
        }
        await state.save()
        const payload = new AlliesAndEnemiesVetoVoteEvent(
            vote,
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

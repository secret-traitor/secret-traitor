import {
    Arg,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    registerEnumType,
    Resolver,
} from 'type-graphql'
import { Inject } from 'typedi'
import { PubSubEngine } from 'graphql-subscriptions'

import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { IGamePlayerDao } from '@daos/GamePlayer'

import { GamePlayerId } from '@entities/GamePlayer'
import { GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'

import { TurnStatus, VoteValue } from '@games/AlliesAndEnemies'

import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'

import { DescriptiveError, ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesVoteEvent extends GameEvent {
    @Field(() => VoteValue)
    public readonly vote: VoteValue

    constructor(
        vote: VoteValue,
        gamePlayerId: GamePlayerId,
        activePlayerId: PlayerId
    ) {
        const state = { gamePlayerId, gameType: GameType.AlliesNEnemies }
        super(state, activePlayerId, AlliesAndEnemiesVoteEvent.name)
        this.vote = vote
    }
}

@Resolver(() => AlliesAndEnemiesVoteEvent)
class AlliesAndEnemiesVoteEventResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @Mutation(() => AlliesAndEnemiesVoteEvent)
    async alliesAndEnemiesVote(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Arg('vote', () => VoteValue) vote: VoteValue,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesVoteEvent>> {
        const { viewingPlayer, state } = await this.getViewingPlayerState(
            gamePlayerId
        )
        const [, error] = state.vote(viewingPlayer.id, vote)
        if (error) {
            return error
        }
        await state.saveTo(this.gameStateDao)
        const payload = new AlliesAndEnemiesVoteEvent(
            vote,
            gamePlayerId,
            viewingPlayer.id
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

registerEnumType(VoteValue, { name: 'VoteValue' })

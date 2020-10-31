import {
    Arg,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
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

import { VoteValue } from '@games/AlliesAndEnemies'

import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'

import { ApiResponse, DescriptiveError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesCallVetoEvent extends GameEvent {
    @Field(() => VoteValue)
    public readonly vote: VoteValue

    constructor(gamePlayerId: GamePlayerId, activePlayerId: PlayerId) {
        const state = { gamePlayerId, gameType: GameType.AlliesNEnemies }
        super(state, activePlayerId, AlliesAndEnemiesCallVetoEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesCallVetoEvent)
class AlliesAndEnemiesCallVetoEventResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @Mutation(() => AlliesAndEnemiesCallVetoEvent)
    async alliesAndEnemiesCallVeto(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesCallVetoEvent>> {
        const { viewingPlayer, state } = await this.getViewingPlayerState(
            gamePlayerId
        )
        if (viewingPlayer.id !== state.currentRound.nomination) {
            return new DescriptiveError(
                'Unable to call veto.',
                'You have not been elected.',
                'Please refresh the page before trying again.'
            )
        }
        const [, error] = state.callVeto()
        if (error) {
            return error
        }
        await state.saveTo(this.gameStateDao)
        const payload = new AlliesAndEnemiesCallVetoEvent(
            gamePlayerId,
            viewingPlayer.id
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

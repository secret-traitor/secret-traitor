import { Arg, ID, Mutation, ObjectType, PubSub, Resolver } from 'type-graphql'
import { Inject } from 'typedi'
import { PubSubEngine } from 'graphql-subscriptions'

import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { IGamePlayerDao } from '@daos/GamePlayer'

import { GamePlayerId } from '@entities/GamePlayer'
import { GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'

import { Card, TurnStatus } from '@games/AlliesAndEnemies'

import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'

import { DescriptiveError, ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesFirstHandDiscardEvent extends GameEvent {
    constructor(gamePlayerId: GamePlayerId, activePlayerId: PlayerId) {
        const state = { gamePlayerId, gameType: GameType.AlliesNEnemies }
        super(state, activePlayerId, AlliesAndEnemiesFirstHandDiscardEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesFirstHandDiscardEvent)
class AlliesAndEnemiesFirstHandDiscardEventResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @Mutation(() => AlliesAndEnemiesFirstHandDiscardEvent)
    async alliesAndEnemiesFirstHandDiscard(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Arg('index', () => Number) index: 0 | 1 | 2,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesFirstHandDiscardEvent>> {
        const { viewingPlayer, state } = await this.getViewingPlayerState(
            gamePlayerId
        )
        if (viewingPlayer.position !== state.currentRound.position) {
            return new DescriptiveError(
                'Unable to play first hand.',
                'It is not your turn.',
                'Please refresh the page before trying again.'
            )
        }
        const [, error] = state.firstHand(index)
        if (error) {
            return error
        }
        await state.saveTo(this.gameStateDao)
        const payload = new AlliesAndEnemiesFirstHandDiscardEvent(
            gamePlayerId,
            viewingPlayer.id
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

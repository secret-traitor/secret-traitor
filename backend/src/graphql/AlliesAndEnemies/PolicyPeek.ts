import {
    Arg,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Query,
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

import {
    Faction,
    PlayerRole,
    PlayerState,
    ViewingPlayerState,
} from '@games/AlliesAndEnemies'

import { AlliesAndEnemiesPlayer, Card } from '@graphql/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'

import { ApiResponse, DescriptiveError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

import { BaseAlliesAndEnemiesResolver } from './resolver'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesPolicyPeekEvent extends GameEvent {
    constructor(gamePlayerId: GamePlayerId, activePlayerId: PlayerId) {
        const state = { gamePlayerId, gameType: GameType.AlliesNEnemies }
        super(state, activePlayerId, AlliesAndEnemiesPolicyPeekEvent.name)
    }
}

@Resolver(() => AlliesAndEnemiesPolicyPeekEvent)
class AlliesAndEnemiesPolicyPeekEventResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @Query(() => [Card])
    async alliesAndEnemiesPolicyPeek(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId
    ): Promise<ApiResponse<[Card, Card, Card]>> {
        const { viewingPlayer, state } = await this.getViewingPlayerState(
            gamePlayerId
        )
        if (viewingPlayer.position !== state.currentRound.position) {
            return new DescriptiveError(
                'Unable to peek at the next policies.',
                'It is not your turn.',
                'Please refresh the page before trying again.'
            )
        }
        const [cards, error] = state.policyPeek()
        if (error) {
            return error
        }
        return cards as [Card, Card, Card]
    }

    @Mutation(() => AlliesAndEnemiesPolicyPeekEvent)
    async alliesAndEnemiesPolicyPeekOk(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesPolicyPeekEvent>> {
        const { viewingPlayer, state } = await this.getViewingPlayerState(
            gamePlayerId
        )
        if (viewingPlayer.position !== state.currentRound.position) {
            return new DescriptiveError(
                'Unable to peek at the next policies.',
                'It is not your turn.',
                'Please refresh the page before trying again.'
            )
        }
        const [, error] = state.policyPeekOk()
        if (error) {
            return error
        }
        await state.saveTo(this.gameStateDao)
        const payload = new AlliesAndEnemiesPolicyPeekEvent(
            gamePlayerId,
            viewingPlayer.id
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

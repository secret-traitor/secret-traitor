import {
    Arg,
    Field,
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

import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'

import { ApiResponse, DescriptiveError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

import { BaseAlliesAndEnemiesResolver } from './resolver'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesSpecialElectionEvent extends GameEvent {
    @Field(() => AlliesAndEnemiesPlayer)
    public readonly nomination: AlliesAndEnemiesPlayer

    constructor(
        nominatedPlayer: ViewingPlayerState,
        gamePlayerId: GamePlayerId,
        activePlayerId: PlayerId
    ) {
        const state = { gamePlayerId, gameType: GameType.AlliesNEnemies }
        super(state, activePlayerId, AlliesAndEnemiesSpecialElectionEvent.name)
        this.nomination = nominatedPlayer
    }
}

@Resolver(() => AlliesAndEnemiesSpecialElectionEvent)
class AlliesAndEnemiesSpecialElectionEventResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @Mutation(() => AlliesAndEnemiesSpecialElectionEvent)
    async alliesAndEnemiesSpecialElection(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesSpecialElectionEvent>> {
        const { viewingPlayer, state } = await this.getViewingPlayerState(
            gamePlayerId
        )
        if (viewingPlayer.position !== state.currentRound.position) {
            return new DescriptiveError(
                'Unable to nominate player.',
                'It is not your turn.',
                'Please refresh the page before nominating another player.'
            )
        }
        const [, error] = state.specialElection(playerId)
        if (error) {
            return error
        }
        await state.saveTo(this.gameStateDao)
        const payload = new AlliesAndEnemiesSpecialElectionEvent(
            state
                .players(viewingPlayer)
                .find((p) => p.id === playerId) as ViewingPlayerState,
            gamePlayerId,
            viewingPlayer.id
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

import { Arg, ID, Mutation, ObjectType, PubSub, Resolver } from 'type-graphql'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { GamePlayerId } from '@entities/GamePlayer'
import { PlayerId } from '@entities/Player'
import { GameType } from '@entities/Game'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'
import { Inject } from 'typedi'
import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { PubSubEngine } from 'graphql-subscriptions'
import { ApiResponse, DescriptiveError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesExecutePlayer extends GameEvent {
    constructor(gamePlayerId: GamePlayerId, activePlayerId: PlayerId) {
        const state = { gamePlayerId, gameType: GameType.AlliesNEnemies }
        super(state, activePlayerId, AlliesAndEnemiesExecutePlayer.name)
    }
}

@Resolver(() => AlliesAndEnemiesExecutePlayer)
class AlliesAndEnemiesExecutePlayerResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @Mutation(() => AlliesAndEnemiesExecutePlayer)
    async alliesAndEnemiesExecutePlayer(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesExecutePlayer>> {
        const { viewingPlayer, state } = await this.getViewingPlayerState(
            gamePlayerId
        )
        if (viewingPlayer.position !== state.currentRound.position) {
            return new DescriptiveError(
                'Unable to play second hand.',
                'It is not your turn.',
                'Please refresh the page before trying again.'
            )
        }
        const [, error] = state.executePlayer(playerId)
        if (error) {
            return error
        }
        await state.saveTo(this.gameStateDao)
        const payload = new AlliesAndEnemiesExecutePlayer(
            gamePlayerId,
            viewingPlayer.id
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

import {
    Arg,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
} from 'type-graphql'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { GamePlayerId } from '@entities/GamePlayer'
import { PlayerId } from '@entities/Player'
import { GameId, GameType } from '@entities/Game'
import { BaseAlliesAndEnemiesResolver } from '@graphql/AlliesAndEnemies/resolver'
import { PubSubEngine } from 'graphql-subscriptions'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies/Player'
import { ViewingPlayerState } from '@games/AlliesAndEnemies'

@ObjectType({ implements: [Event, GameEvent] })
export class AlliesAndEnemiesExecutePlayer extends GameEvent {
    @Field(() => AlliesAndEnemiesPlayer)
    public readonly executedPlayer: AlliesAndEnemiesPlayer

    constructor(
        executedPlayer: ViewingPlayerState,
        gameId: GamePlayerId,
        playerId: PlayerId
    ) {
        const state = { gameId, playerId, gameType: GameType.AlliesNEnemies }
        super(state, playerId, AlliesAndEnemiesExecutePlayer.name)
        this.executedPlayer = executedPlayer
    }
}

@Resolver(() => AlliesAndEnemiesExecutePlayer)
class AlliesAndEnemiesExecutePlayerResolver extends BaseAlliesAndEnemiesResolver {
    @Mutation(() => AlliesAndEnemiesExecutePlayer)
    async alliesAndEnemiesExecutePlayer(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('executePlayerId', () => ID) executePlayerId: PlayerId,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesExecutePlayer>> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
        const result = state.executePlayer(executePlayerId)
        if ('error' in result) {
            return result.error
        }
        const executedPlayer = result.executedPlayer
        await state.save()
        const payload = new AlliesAndEnemiesExecutePlayer(
            executedPlayer,
            gameId,
            playerId
        )
        await pubSub.publish(getTopicName(Topics.Play, state.gameId), payload)
        return payload
    }
}

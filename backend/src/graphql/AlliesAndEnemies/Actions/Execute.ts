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

import { ViewingPlayerState } from '@entities/AlliesAndEnemies'
import { PlayerId } from '@entities/Player'
import { GameId, GameType } from '@entities/Game'
import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies/Player'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'
import Context from '@shared/Context'

@ObjectType({ implements: [Event, GameEvent] })
class AlliesAndEnemiesExecutePlayer extends GameEvent {
    @Field(() => AlliesAndEnemiesPlayer)
    public readonly executedPlayer: AlliesAndEnemiesPlayer

    constructor(
        executedPlayer: ViewingPlayerState,
        gameId: GameId,
        viewingPlayerId: PlayerId
    ) {
        const state = {
            gameId,
            viewingPlayerId,
            gameType: GameType.AlliesNEnemies,
        }
        super(state, viewingPlayerId, AlliesAndEnemiesExecutePlayer.name)
        this.executedPlayer = executedPlayer
    }
}

@Resolver(() => AlliesAndEnemiesExecutePlayer)
class AlliesAndEnemiesExecutePlayerResolver {
    @Mutation(() => AlliesAndEnemiesExecutePlayer)
    async alliesAndEnemiesExecutePlayer(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Arg('executePlayerId', () => ID) executePlayerId: PlayerId,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<AlliesAndEnemiesExecutePlayer>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        const result = state.executePlayer(executePlayerId)
        if ('error' in result) {
            return result.error
        }
        const executedPlayer = result.executedPlayer
        await state.save()
        const payload = new AlliesAndEnemiesExecutePlayer(
            executedPlayer,
            gameId,
            viewingPlayerId
        )
        await pubSub.publish(getTopicName(Topics.Play, gameId), payload)
        return payload
    }
}

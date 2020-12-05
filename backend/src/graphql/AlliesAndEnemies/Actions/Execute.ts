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

import { ViewingPlayerState } from 'src/entities/AlliesAndEnemies'
import { PlayerId } from 'src/entities/Player'
import { GameId, GameType } from 'src/entities/Game'
import { AlliesAndEnemiesPlayer } from 'src/graphql/AlliesAndEnemies/Player'
import { Event } from 'src/graphql/Event'
import { GameEvent } from 'src/graphql/GameEvent'
import { ApiResponse } from 'src/shared/api'
import { getTopicName, Topics } from 'src/shared/topics'
import Context from 'src/shared/Context'

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

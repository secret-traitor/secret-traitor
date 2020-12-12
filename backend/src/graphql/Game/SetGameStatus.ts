import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
    Root,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import { GameId, GameStatus, IGame } from 'src/entities/Game'
import { PlayerId } from 'src/entities/Player'
import { Event } from 'src/graphql/Event'
import { GameEvent } from 'src/graphql/GameEvent'
import { ApiResponse, DescriptiveError } from 'src/shared/api'
import { getTopicName, Topics } from 'src/shared/topics'
import Context from 'src/shared/Context'

type GameStateEvent = {
    game: IGame
    newStatus: GameStatus
    oldStatus: GameStatus
    viewingPlayerId: PlayerId
}

@ObjectType({ implements: [Event, GameEvent] })
export class GameStatusEvent extends GameEvent {
    readonly newStatus: GameStatus
    readonly oldStatus: GameStatus

    constructor({
        game,
        newStatus,
        oldStatus,
        viewingPlayerId,
    }: GameStateEvent) {
        const state = { gameId: game.id, gameType: game.type, viewingPlayerId }
        super(state, viewingPlayerId, GameStatusEvent.name)
        this.newStatus = newStatus
        this.oldStatus = oldStatus
    }
}

@ObjectType()
class UpdatedGameStatus {
    @Field(() => GameStatus)
    public readonly current: GameStatus
    @Field(() => GameStatus)
    public readonly last: GameStatus
}

@Resolver(() => GameStatusEvent)
export class SetGameStatusResolver {
    @FieldResolver(() => UpdatedGameStatus)
    status(
        @Root() { oldStatus, newStatus }: GameStatusEvent
    ): UpdatedGameStatus {
        return { last: oldStatus, current: newStatus }
    }

    @Mutation(() => GameStatusEvent, { nullable: true })
    async setGameStatus(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) viewingPlayerId: PlayerId,
        @Arg('status', () => GameStatus) status: GameStatus,
        @Ctx() { dataSources: { games, alliesAndEnemies } }: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<GameStatusEvent | null>> {
        const oldGame = await games.load(gameId)
        if (!oldGame) {
            return new DescriptiveError('')
        }
        const newGame = { ...oldGame, status }
        let ok = false
        if (
            oldGame.status === GameStatus.InLobby &&
            newGame.status === GameStatus.InProgress
        ) {
            ok = await alliesAndEnemies.start(gameId, viewingPlayerId)
        }
        if (
            oldGame.status === GameStatus.InProgress &&
            newGame.status === GameStatus.InLobby
        ) {
            ok = await alliesAndEnemies.delete(gameId)
        }
        if (ok) {
            await games.put(newGame)
            const payload = new GameStatusEvent({
                game: newGame,
                viewingPlayerId,
                oldStatus: oldGame.status,
                newStatus: newGame.status,
            })
            await pubSub.publish(getTopicName(Topics.Play, newGame.id), payload)
            return payload
        }
        return null
    }
}

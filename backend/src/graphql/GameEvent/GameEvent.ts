import {
    Arg,
    FieldResolver,
    ID,
    InterfaceType,
    Resolver,
    Root,
    Subscription,
} from 'type-graphql'

import GamesClient from '@clients/Games'
import { GameId, IGame } from '@entities/Game'
import { PlayerId, IPlayer } from '@entities/Player'
import { Event } from '@graphql/Event'
import { Game } from '@graphql/Game'
import { GameState, IGameState } from '@graphql/GameState'
import { Player } from '@graphql/Player'
import { getTopicName, Topics } from '@shared/topics'

export type IGameEvent = {
    source: PlayerId
    state: IGameState
}

@InterfaceType({
    resolveType: (args: GameEvent) => args.eventType,
})
export abstract class GameEvent extends Event implements IGameEvent {
    protected constructor(
        public readonly state: Required<IGameState>,
        public readonly source: Required<PlayerId>,
        public readonly eventType: Required<string>
    ) {
        super(eventType)
    }
}

@Resolver(() => GameEvent)
class GameEventResolver {
    @FieldResolver(() => Game, { nullable: true })
    async game(
        @Root() { state: { gameId } }: IGameEvent
    ): Promise<IGame | null> {
        return (await GamesClient.games.get(gameId)) || null
    }

    @FieldResolver(() => Player, { nullable: true })
    async player(
        @Root() { state: { gameId, playerId } }: IGameEvent
    ): Promise<IPlayer | null> {
        return (await GamesClient.players.get(gameId, playerId)) || null
    }

    @FieldResolver(() => GameState, { nullable: true })
    async state(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Root() { state: { gameType } }: IGameEvent
    ): Promise<IGameState | null> {
        const state = await GamesClient.state.get(gameId)
        if (!state) {
            return null
        }
        return { gameId, playerId, gameType }
    }

    @FieldResolver(() => Player, { name: 'source' })
    async sourcePlayer(@Root() { state: { gameId }, source }: IGameEvent) {
        return await GamesClient.players.get(gameId, source)
    }

    @Subscription(() => GameEvent, {
        topics: ({ args }) => getTopicName(Topics.Play, args.gameId),
    })
    play(
        @Arg('gameId', () => ID) gameId: GameId,
        @Root() event: IGameEvent
    ): IGameEvent {
        return event
    }
}

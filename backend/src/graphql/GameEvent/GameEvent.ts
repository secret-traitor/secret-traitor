import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    ID,
    InterfaceType,
    Resolver,
    Root,
    Subscription,
} from 'type-graphql'

import { GameId, IGame } from '@entities/Game'
import { PlayerId, IPlayer } from '@entities/Player'
import { Event } from '@graphql/Event'
import { Game } from '@graphql/Game'
import { IGameState } from '@graphql/GameState'
import { Player } from '@graphql/Player'
import { getTopicName, Topics } from '@shared/topics'
import Context from '@shared/Context'
import logger from '@shared/Logger'

export type IGameEvent = {
    readonly source: PlayerId
    readonly state: IGameState
}

@InterfaceType({
    resolveType: (args: GameEvent) => args.eventType,
})
export abstract class GameEvent extends Event implements IGameEvent {
    protected constructor(
        public state: Required<IGameState>,
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
        @Root() { state: { gameId } }: IGameEvent,
        @Ctx() { dataSources: { games } }: Context
    ): Promise<IGame | undefined> {
        return await games.load(gameId)
    }

    @FieldResolver(() => Player, { name: 'source', nullable: true })
    async sourcePlayer(
        @Root() { state: { gameId }, source }: IGameEvent,
        @Ctx() { dataSources: { players } }: Context
    ): Promise<IPlayer | undefined> {
        return await players.get(gameId, source)
    }

    @Subscription(() => GameEvent, {
        topics: ({ args }) => {
            const topic = getTopicName(Topics.Play, args.gameId)
            logger.debug(`Listening on "${topic}"`)
            return topic
        },
    })
    play(
        @Arg('gameId', () => ID) gameId: GameId,
        @Root() event: IGameEvent
    ): IGameEvent {
        const topic = getTopicName(Topics.Play, gameId)
        logger.debug(`Event on  "${topic}": ${JSON.stringify(event)}`)
        return event
    }
}

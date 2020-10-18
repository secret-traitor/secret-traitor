import {
    Arg,
    FieldResolver,
    ID,
    InterfaceType,
    Resolver,
    Root,
    Subscription,
} from 'type-graphql'
import { Inject } from 'typedi'

import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'

import { GamePlayerId } from '@entities/GamePlayer'
import { PlayerId } from '@entities/Player'

import { Event } from '@graphql/Event'
import { GameState, IGameState } from '@graphql/GameState'
import { Player } from '@graphql/Player'
import GameManager from '@games/GameManager'
import { getTopicName, Topics } from '@shared/topics'
import { GameId } from '@entities/Game'

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
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao,
        @Inject('Players') private readonly playerDao: IPlayerDao
    ) {}

    @FieldResolver(() => GameState, { nullable: true })
    state(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Root() event: IGameEvent
    ): IGameState {
        return {
            gamePlayerId,
            gameType: event.state.gameType,
        } as IGameState
    }

    @FieldResolver(() => Player)
    async source(@Root() event: IGameEvent) {
        return await this.playerDao.get({ id: event.source })
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

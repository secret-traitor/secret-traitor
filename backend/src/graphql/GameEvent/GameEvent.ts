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

import { GameId, IGame } from '@entities/Game'
import { GamePlayerId } from '@entities/GamePlayer'
import { PlayerId, IPlayer } from '@entities/Player'

import { Event } from '@graphql/Event'
import { Game } from '@graphql/Game'
import { GameState, IGameState } from '@graphql/GameState'
import { Player } from '@graphql/Player'

import { getTopicName, Topics } from '@shared/topics'
import GameManager from '@games/GameManager'

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

    @FieldResolver(() => Game, { nullable: true })
    async game(@Root() event: IGameEvent): Promise<IGame | null> {
        const gamePlayer = await this.gamePlayerDao.get({
            id: event.state.gamePlayerId,
        })
        if (!gamePlayer) {
            return null
        }
        const game = await this.gameDao.get({ id: gamePlayer.gameId })
        if (!game) {
            return null
        }
        return game
    }

    @FieldResolver(() => Player, { nullable: true })
    async player(@Root() event: IGameEvent): Promise<IPlayer | null> {
        const gamePlayer = await this.gamePlayerDao.get({
            id: event.state.gamePlayerId,
        })
        if (!gamePlayer) {
            return null
        }
        const player = await this.playerDao.get({ id: gamePlayer.playerId })
        if (!player) {
            return null
        }
        return player
    }

    @FieldResolver(() => GameState, { nullable: true })
    async state(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Root() event: IGameEvent
    ): Promise<IGameState | null> {
        const gamePlayer = await this.gamePlayerDao.get({ id: gamePlayerId })
        if (!gamePlayer) {
            return null
        }
        const game = await this.gameDao.get({ id: gamePlayer.gameId })
        if (!game) {
            return null
        }
        const gm = new GameManager(game.id, game.type)
        if (!(await gm.exists())) {
            return null
        }
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

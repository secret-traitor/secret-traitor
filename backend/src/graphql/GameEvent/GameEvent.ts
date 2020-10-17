import { FieldResolver, InterfaceType, Resolver, Root } from 'type-graphql'

import { GamePlayerId } from '@entities/GamePlayer'
import { GameType } from '@entities/Game'

import { Event } from '@graphql/Event'
import { IGameState, GameState } from '@graphql/GameState'

import { ApiResponse } from '@shared/api'

export type IGameStateEvent = IGameState

@InterfaceType({
    resolveType: (args: GameStateEvent) => args.eventType,
})
export abstract class GameStateEvent extends Event implements IGameStateEvent {
    public readonly gamePlayerId: GamePlayerId
    public readonly gameType: GameType

    protected constructor(
        gamePlayerId: GamePlayerId,
        gameType: GameType,
        eventType: string,
        source?: string
    ) {
        super(eventType, source)
        this.gamePlayerId = gamePlayerId
        this.gameType = gameType
    }
}

@Resolver(() => GameStateEvent)
export class GameStateEventResolver {
    @FieldResolver(() => GameState)
    gameState(@Root() event: GameStateEvent): ApiResponse<IGameState> {
        return event
    }
}

import { Field, InterfaceType } from 'type-graphql'

import { GameId, GameType } from 'src/entities/Game'
import { PlayerId } from 'src/entities/Player'
import { AlliesAndEnemiesGameState } from 'src/graphql/AlliesAndEnemies'

export interface IGameState {
    readonly gameId: GameId
    readonly gameType: GameType
    readonly viewingPlayerId: PlayerId
}

@InterfaceType({
    resolveType: ({ gameType }: IGameState) => {
        const GameStateResolutionTypeRecord: Record<GameType, string> = {
            [GameType.AlliesNEnemies]: AlliesAndEnemiesGameState.name,
        }
        return GameStateResolutionTypeRecord[gameType]
    },
})
export abstract class GameState implements IGameState {
    @Field(() => String)
    readonly gameId: GameId

    @Field(() => GameType)
    readonly gameType: GameType

    @Field(() => String)
    readonly viewingPlayerId: PlayerId

    protected constructor(
        viewingPlayerId: PlayerId,
        gameId: GameId,
        gameType: GameType
    ) {
        this.gameType = gameType
        this.gameId = gameId
        this.viewingPlayerId = viewingPlayerId
    }
}

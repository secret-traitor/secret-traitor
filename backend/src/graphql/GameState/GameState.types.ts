import { InterfaceType } from 'type-graphql'

import { GameType } from '@entities/Game'
import { GamePlayerId } from '@entities/GamePlayer'

import { AlliesNEnemiesGameState } from '@graphql/AlliesAndEnemies'

import { ApiError } from '@shared/api'

export interface IGameState {
    gamePlayerId: Required<GamePlayerId>
    gameType: Required<GameType>
}

@InterfaceType({
    resolveType: (args: IGameState) => {
        const GameStateResolutionTypeRecord: Record<GameType, string> = {
            [GameType.AlliesNEnemies]: AlliesNEnemiesGameState.name,
        }
        const type = GameStateResolutionTypeRecord[args.gameType]
        if (!type) {
            throw new ApiError(
                'Unable to resolve game state type.',
                `"${args.gameType}" is not a recognized game type.`
            )
        }
        return type
    },
})
export abstract class GameState implements IGameState {
    protected constructor(
        public readonly gamePlayerId: Required<GamePlayerId>,
        public readonly gameType: Required<GameType>
    ) {}
}

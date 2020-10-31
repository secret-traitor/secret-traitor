import { InterfaceType } from 'type-graphql'

import { GameType } from '@entities/Game'
import { GamePlayerId } from '@entities/GamePlayer'

import { AlliesAndEnemiesGameState } from '@graphql/AlliesAndEnemies'

import { DescriptiveError } from '@shared/api'

export interface IGameState {
    readonly gamePlayerId: Required<GamePlayerId>
    readonly gameType: Required<GameType>
}

@InterfaceType({
    resolveType: (args: IGameState) => {
        const GameStateResolutionTypeRecord: Record<GameType, string> = {
            [GameType.AlliesNEnemies]: AlliesAndEnemiesGameState.name,
        }
        const type = GameStateResolutionTypeRecord[args.gameType]
        if (!type) {
            throw new DescriptiveError(
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

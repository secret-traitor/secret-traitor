import {
    Arg,
    Ctx,
    FieldResolver,
    ID,
    InterfaceType,
    Query,
    Resolver,
    Root,
} from 'type-graphql'

import GamesClient from '@clients/Games'
import { GameId, GameType, IGame } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { AlliesAndEnemiesGameState } from '@graphql/AlliesAndEnemies'
import { Game } from '@graphql/Game'
import { ApiResponse, DescriptiveError } from '@shared/api'
import Context from '@shared/Context'

export interface IGameState {
    readonly playerId: Required<PlayerId>
    readonly gameId: Required<GameId>
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
        public readonly playerId: Required<PlayerId>,
        public readonly gameId: Required<GameId>,
        public readonly gameType: Required<GameType>
    ) {}
}

@Resolver(() => GameState)
class GameStateResolver {
    @FieldResolver(() => Game)
    async game(
        @Root() { gameId }: IGameState,
        @Ctx() { dataSources: { games } }: Context
    ): Promise<ApiResponse<IGame>> {
        const game = await games.get(gameId)
        if (!game) {
            throw new DescriptiveError(
                'Unable to look up game.',
                'No game with this code found.'
            )
        }
        return game
    }

    @Query(() => GameState, { nullable: true })
    async state(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Ctx() { dataSources: { games } }: Context
    ): Promise<IGameState | null> {
        const game = await games.get(gameId)
        if (!game) {
            throw new DescriptiveError(
                'Unable to look up game.',
                'No game with this code found.'
            )
        }
        const state = await GamesClient.state.get(gameId)
        if (!state) {
            return null
        }
        return { gameId, playerId, gameType: game.type }
    }
}

import { Inject, Service } from 'typedi'
import { Arg, FieldResolver, ID, Query, Resolver, Root } from 'type-graphql'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { IGame } from '@entities/Game'
import { GamePlayerId } from '@entities/GamePlayer'

import { Game } from '@graphql/Game'
import { DescriptiveError, ApiResponse } from '@shared/api'

import { GameState, IGameState } from './GameState.types'
import GameManager from '@games/GameManager'

@Service()
@Resolver(() => GameState)
export class GameStateResolver {
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao,
        @Inject('Players') private readonly playerDao: IPlayerDao
    ) {}

    @FieldResolver(() => ID)
    playId(@Root() state: IGameState): string {
        return state.gamePlayerId
    }

    @FieldResolver(() => Game)
    async game(@Root() state: IGameState): Promise<ApiResponse<IGame>> {
        const gamePlayer = await this.gamePlayerDao.get({
            id: state.gamePlayerId,
        })
        if (!gamePlayer) {
            throw new DescriptiveError(
                'Unable to look up player for this game.',
                'No game and player with this id found.'
            )
        }
        const game = await this.gameDao.get({ id: gamePlayer.gameId })
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
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId
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
            gameType: game.type,
            gamePlayerId,
        } as IGameState
    }
}

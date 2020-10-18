import { Inject, Service } from 'typedi'
import { Arg, FieldResolver, ID, Query, Resolver, Root } from 'type-graphql'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { GameId, IGame } from '@entities/Game'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { IPlayer, PlayerId } from '@entities/Player'
import { Game } from '@graphql/Game'
import { Player } from '@graphql/Player'
import { ApiError, ApiResponse } from '@shared/api'

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

    private async getGamePlayer(id: GamePlayerId): Promise<IGamePlayer> {
        const gamePlayer = await this.gamePlayerDao.get({ id })
        if (!gamePlayer) {
            throw new ApiError(
                'Unable to look up player for this game.',
                'No game and player with this id found.'
            )
        }
        return gamePlayer
    }

    private async getPlayer(id: PlayerId): Promise<IPlayer> {
        const player = await this.playerDao.get({ id })
        if (!player) {
            throw new ApiError(
                'Unable to look up player.',
                'No game with this player found.'
            )
        }
        return player
    }

    private async getGame(id: GameId): Promise<IGame> {
        const game = await this.gameDao.get({ id })
        if (!game) {
            throw new ApiError(
                'Unable to look up game.',
                'No game with this code found.'
            )
        }
        return game
    }

    @FieldResolver(() => Game)
    async game(@Root() state: IGameState): Promise<ApiResponse<IGame>> {
        try {
            const gamePlayer = await this.getGamePlayer(state.gamePlayerId)
            return await this.getGame(gamePlayer.gameId)
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }

    @Query(() => GameState, { nullable: true })
    state(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Root() state: IGameState
    ): IGameState {
        return {
            gameType: state.gameType,
            gamePlayerId,
        } as IGameState
    }
}

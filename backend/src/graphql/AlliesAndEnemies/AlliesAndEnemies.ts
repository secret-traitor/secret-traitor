import find from 'lodash/find'
import last from 'lodash/last'
import filter from 'lodash/filter'
import {
    FieldResolver,
    ObjectType,
    registerEnumType,
    Resolver,
    Root,
} from 'type-graphql'
import { Inject } from 'typedi'

import { IAlliesAndEnemiesDao } from '@daos/AlliesNEnemies'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { GameState } from '@graphql/GameState'

import { GameId, GameType } from '@entities/Game'

import { ApiError, ApiResponse } from '@shared/api'

import { CurrentTurn } from './CurrentTurn'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { IPlayer } from '@entities/Player'
import {
    AlliesAndEnemiesState,
    BoardActionType,
    CardSuit,
    PlayerRole,
    TurnStatus,
} from '@games/AlliesAndEnemies'
import { BoardState } from '@graphql/AlliesAndEnemies/BoardState'
import { TeamDetails } from '@graphql/AlliesAndEnemies/TeamDetails'

export type IAlliesNEnemiesGameState = GameState

@ObjectType({ implements: [GameState] })
export class AlliesNEnemiesGameState
    extends GameState
    implements IAlliesNEnemiesGameState {
    constructor(gamePlayerId: string) {
        super(gamePlayerId, GameType.AlliesNEnemies)
    }
}

@Resolver(() => AlliesNEnemiesGameState)
export class AlliesNEnemiesGameStateResolver {
    @Inject('AlliesAndEnemies')
    private readonly gameStateDao: IAlliesAndEnemiesDao
    @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao
    @Inject('Games') private readonly gameDao: IGameDao
    @Inject('Players') private readonly playerDao: IPlayerDao

    constructor(
        gameDao: IGameDao,
        gamePlayerDao: IGamePlayerDao,
        gameStateDao: IAlliesAndEnemiesDao,
        playerDao: IPlayerDao
    ) {
        this.gameDao = gameDao
        this.gamePlayerDao = gamePlayerDao
        this.gameStateDao = gameStateDao
        this.playerDao = playerDao
    }

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

    private async getState(gameId: GameId): Promise<AlliesAndEnemiesState> {
        const state = await this.gameStateDao.get({ gameId })
        if (!state) {
            throw new ApiError(
                'Unable to look up game state.',
                'No state data for this game found.'
            )
        }
        return state
    }

    @FieldResolver(() => TeamDetails)
    async team(
        @Root() root: IAlliesNEnemiesGameState
    ): Promise<ApiResponse<TeamDetails>> {
        try {
            const gamePlayer = await this.getGamePlayer(root.gamePlayerId)
            const state = await this.getState(gamePlayer.gameId)
            const playerState = find(
                state.players,
                (p) => p.id === gamePlayer.playerId
            )
            if (!playerState) {
                return new ApiError('')
            }
            const teammates =
                playerState.role === PlayerRole.Ally ||
                (playerState.role === PlayerRole.EnemyLeader &&
                    state.leaderIsSecret)
                    ? null
                    : filter(
                          state.players,
                          (p) =>
                              (playerState.role === PlayerRole.Ally
                                  ? p.role === PlayerRole.Ally
                                  : [
                                        PlayerRole.EnemyLeader,
                                        PlayerRole.Enemy,
                                    ].includes(p.role)) &&
                              p.id !== playerState.id
                      )
            return {
                playerRole: playerState.role,
                teammates,
            } as TeamDetails
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }

    @FieldResolver(() => CurrentTurn, { nullable: true })
    async currentTurn(
        @Root() root: IAlliesNEnemiesGameState
    ): Promise<ApiResponse<CurrentTurn | null>> {
        try {
            const gamePlayer = await this.getGamePlayer(root.gamePlayerId)
            const state = await this.getState(gamePlayer.gameId)
            const currentTurn = last(state.rounds)
            if (!currentTurn) {
                return null
            }
            const currentPlayer = find(
                state.players,
                (p) => p.position === currentTurn?.position
            )
            if (!currentPlayer) {
                return new ApiError('no currentPlayer')
            }
            return {
                ...currentTurn,
                playerId: currentPlayer.id,
            } as CurrentTurn
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }

    @FieldResolver(() => BoardState)
    async board(
        @Root() root: IAlliesNEnemiesGameState
    ): Promise<ApiResponse<BoardState | null>> {
        try {
            const gamePlayer = await this.getGamePlayer(root.gamePlayerId)
            const state = await this.getState(gamePlayer.gameId)
            return state.board
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }
}

registerEnumType(BoardActionType, { name: 'BoardActionType' })
registerEnumType(CardSuit, { name: 'CardSuit' })
registerEnumType(TurnStatus, { name: 'TurnStatus' })
registerEnumType(PlayerRole, { name: 'PlayerRole' })

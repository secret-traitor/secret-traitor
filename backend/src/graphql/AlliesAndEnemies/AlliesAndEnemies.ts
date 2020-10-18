import {
    FieldResolver,
    ObjectType,
    registerEnumType,
    Resolver,
    Root,
} from 'type-graphql'
import { Inject } from 'typedi'

import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import {
    AlliesAndEnemiesState,
    BoardActionType,
    CardSuit,
    PlayerRole,
    TurnStatus,
} from '@games/AlliesAndEnemies'

import { GameState, IGameState } from '@graphql/GameState'

import { GameId, GameType } from '@entities/Game'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'

import { ApiError, ApiResponse } from '@shared/api'

import { BoardState } from './BoardState'
import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies/Player'
import { Player } from '@graphql/Player'
import { IPlayer, PlayerId } from '@entities/Player'

@ObjectType({ implements: [GameState] })
export class AlliesNEnemiesGameState extends GameState {
    constructor(gamePlayerId: string) {
        super(gamePlayerId, GameType.AlliesNEnemies)
    }
}

function filterRoleForPlayer(
    playerRole: PlayerRole,
    filteredRole: PlayerRole,
    leaderIsSecret: boolean
): PlayerRole | null {
    if (playerRole === PlayerRole.Ally) {
        return null
    }
    if (playerRole === PlayerRole.EnemyLeader && leaderIsSecret) {
        return null
    }
    return filteredRole
}

@Resolver(() => AlliesNEnemiesGameState)
export class AlliesNEnemiesGameStateResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        private readonly gameStateDao: IAlliesAndEnemiesDao,
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
                'Unable to look up player for this game.',
                'No game and player with this id found.'
            )
        }
        return player
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

    // @FieldResolver(() => TeamDetails, { nullable: true })
    // async team(
    //     @Root() root: IGameState
    // ): Promise<ApiResponse<TeamDetails | null>> {
    //     try {
    //         const gamePlayer = await this.getGamePlayer(root.gamePlayerId)
    //         const state = await this.getState(gamePlayer.gameId)
    //         const playerState = find(
    //             state.players,
    //             (p) => p.id === gamePlayer.playerId
    //         )
    //         if (!playerState) {
    //             return null
    //         }
    //         const teammates =
    //             playerState.role === PlayerRole.Ally ||
    //             (playerState.role === PlayerRole.EnemyLeader &&
    //                 state.leaderIsSecret)
    //                 ? null
    //                 : filter(
    //                       state.players,
    //                       (p) =>
    //                           (playerState.role === PlayerRole.Ally
    //                               ? p.role === PlayerRole.Ally
    //                               : [
    //                                     PlayerRole.EnemyLeader,
    //                                     PlayerRole.Enemy,
    //                                 ].includes(p.role)) &&
    //                           p.id !== playerState.id
    //                   )
    //         return (
    //             ({
    //                 playerRole: playerState.role,
    //                 teammates,
    //             } as TeamDetails) || null
    //         )
    //     } catch (e) {
    //         if (e instanceof ApiError) {
    //             return null
    //         }
    //         throw e
    //     }
    // }

    // @FieldResolver(() => CurrentTurn, { nullable: true })
    // async currentTurn(
    //     @Root() root: IGameState
    // ): Promise<ApiResponse<CurrentTurn | null>> {
    //     try {
    //         const gamePlayer = await this.getGamePlayer(root.gamePlayerId)
    //         const state = await this.getState(gamePlayer.gameId)
    //         const currentTurn = last(state.rounds)
    //         if (!currentTurn) {
    //             return null
    //         }
    //         const currentPlayer = find(
    //             state.players,
    //             (p) => p.position === currentTurn?.position
    //         )
    //         if (!currentPlayer) {
    //             return null
    //         }
    //         return (
    //             ({
    //                 ...currentTurn,
    //                 playerId: currentPlayer.id,
    //             } as CurrentTurn) || null
    //         )
    //     } catch (e) {
    //         if (e instanceof ApiError) {
    //             return null
    //         }
    //         throw e
    //     }
    // }

    @FieldResolver(() => BoardState)
    async board(@Root() root: IGameState): Promise<ApiResponse<BoardState>> {
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

    @FieldResolver(() => AlliesAndEnemiesPlayer)
    async activePlayer(
        @Root() root: IGameState
    ): Promise<ApiResponse<AlliesAndEnemiesPlayer>> {
        try {
            const gamePlayer = await this.getGamePlayer(root.gamePlayerId)
            const state = await this.getState(gamePlayer.gameId)
            const playerState = state.players.find(
                (p) => p.id === gamePlayer.playerId
            )
            return playerState as AlliesAndEnemiesPlayer
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }

    @FieldResolver(() => [AlliesAndEnemiesPlayer])
    async players(@Root() root: IGameState): Promise<AlliesAndEnemiesPlayer[]> {
        try {
            const gamePlayer = await this.getGamePlayer(root.gamePlayerId)
            const state = await this.getState(gamePlayer.gameId)
            const playerState = state.players.find(
                (p) => p.id === gamePlayer.playerId
            )
            if (!playerState) {
                return []
            }
            return state.players.map((p) => {
                const role = filterRoleForPlayer(
                    playerState.role,
                    p.role,
                    state.leaderIsSecret
                )
                return { ...p, role } as AlliesAndEnemiesPlayer
            })
        } catch (e) {
            if (e instanceof ApiError) {
                return []
            }
            throw e
        }
    }
}

registerEnumType(BoardActionType, { name: 'BoardActionType' })
registerEnumType(CardSuit, { name: 'CardSuit' })
registerEnumType(TurnStatus, { name: 'TurnStatus' })
registerEnumType(PlayerRole, { name: 'PlayerRole' })

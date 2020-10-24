import {
    FieldResolver,
    ObjectType,
    registerEnumType,
    Resolver,
    Root,
} from 'type-graphql'
import { Inject, Service } from 'typedi'

import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { GameType } from '@entities/Game'

import {
    BoardActionType,
    CardSuit,
    PlayerRole,
    TurnStatus,
} from '@games/AlliesAndEnemies'

import {
    AlliesAndEnemiesPlayer,
    CurrentTurn,
    BoardState,
} from '@graphql/AlliesAndEnemies'
import { GameState, IGameState } from '@graphql/GameState'

import { DescriptiveError, ApiResponse } from '@shared/api'

import { BaseAlliesAndEnemiesResolver } from './resolver'

@ObjectType({ implements: [GameState] })
export class AlliesAndEnemiesGameState extends GameState {
    constructor(gamePlayerId: string) {
        super(gamePlayerId, GameType.AlliesNEnemies)
    }
}

@Service()
@Resolver(() => AlliesAndEnemiesGameState)
export class AlliesAndEnemiesGameStateResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @FieldResolver(() => BoardState)
    async board(
        @Root() { gamePlayerId }: IGameState
    ): Promise<ApiResponse<BoardState>> {
        try {
            const gamePlayer = await this.getGamePlayer(gamePlayerId)
            const state = await this.getState(gamePlayer.gameId)
            return state.board
        } catch (e) {
            if (e instanceof DescriptiveError) {
                return e
            }
            throw e
        }
    }

    @FieldResolver(() => AlliesAndEnemiesPlayer)
    async viewingPlayer(
        @Root() { gamePlayerId }: IGameState
    ): Promise<ApiResponse<AlliesAndEnemiesPlayer>> {
        try {
            const { state, viewingPlayer } = await this.getViewingPlayerState(
                gamePlayerId
            )
            const playerState = state.viewingPlayer(viewingPlayer)
            if (!playerState) {
                return new DescriptiveError('unable to look up player state')
            }
            return playerState
        } catch (e) {
            if (e instanceof DescriptiveError) {
                return e
            }
            throw e
        }
    }

    @FieldResolver(() => [AlliesAndEnemiesPlayer])
    async players(
        @Root() { gamePlayerId }: IGameState
    ): Promise<AlliesAndEnemiesPlayer[]> {
        try {
            const { state, viewingPlayer } = await this.getViewingPlayerState(
                gamePlayerId
            )
            if (!viewingPlayer) {
                return []
            }
            return state.players(viewingPlayer)
        } catch (e) {
            if (e instanceof DescriptiveError) {
                return []
            }
            throw e
        }
    }

    @FieldResolver(() => CurrentTurn)
    async currentTurn(
        @Root() { gamePlayerId }: IGameState
    ): Promise<ApiResponse<CurrentTurn | null>> {
        try {
            const { state, viewingPlayer } = await this.getViewingPlayerState(
                gamePlayerId
            )
            const nominatedPlayer = state
                .players(viewingPlayer)
                .find((p) => p.id === state.currentRound.nomination)
            return {
                ...state.currentRound,
                currentPlayer: state.currentPlayer(viewingPlayer),
                ineligibleNominations: state.ineligibleNominations(
                    viewingPlayer
                ),
                nominatedPlayer,
            } as CurrentTurn
        } catch (e) {
            if (e instanceof DescriptiveError) {
                return null
            }
            throw e
        }
    }
}

registerEnumType(BoardActionType, { name: 'BoardActionType' })
registerEnumType(CardSuit, { name: 'CardSuit' })
registerEnumType(TurnStatus, { name: 'TurnStatus' })
registerEnumType(PlayerRole, { name: 'PlayerRole' })

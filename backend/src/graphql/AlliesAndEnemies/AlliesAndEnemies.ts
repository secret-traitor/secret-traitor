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
    BoardAction,
    Faction,
    PlayerRole,
    PlayerStatus,
    TurnStatus,
    Victory,
    VictoryType,
    VoteValue,
} from '@games/AlliesAndEnemies'

import {
    AlliesAndEnemiesPlayer,
    CurrentTurn,
    BoardState,
    BoardRow,
    CurrentTurnRoot,
} from '@graphql/AlliesAndEnemies'
import { GameState, IGameState } from '@graphql/GameState'

import { DescriptiveError, ApiResponse } from '@shared/api'

import { BaseAlliesAndEnemiesResolver } from './resolver'
import { AlliesAndEnemiesVictoryStatus } from '@graphql/AlliesAndEnemies/VictoryStatus'

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
            return {
                ally: {
                    cards: state.board.ally,
                    maxCards: state.config.victory.allyCards,
                } as BoardRow,
                enemy: {
                    cards: state.board.enemy,
                    maxCards: state.config.victory.enemyCards,
                } as BoardRow,
                actions: state.config.actions,
            } as BoardState
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
    ): Promise<CurrentTurnRoot> {
        return await this.getViewingPlayerState(gamePlayerId)
    }

    @FieldResolver(() => AlliesAndEnemiesVictoryStatus, { nullable: true })
    async victoryStatus(
        @Root() { gamePlayerId }: IGameState
    ): Promise<Victory | null> {
        const { state } = await this.getViewingPlayerState(gamePlayerId)
        return state.victory
    }
}

const prefix = 'AlliesAndEnemies'
registerEnumType(BoardAction, { name: prefix + 'BoardActionType' })
registerEnumType(Faction, { name: prefix + 'Faction' })
registerEnumType(PlayerRole, { name: prefix + 'PlayerRole' })
registerEnumType(PlayerStatus, { name: prefix + 'PlayerStatus' })
registerEnumType(TurnStatus, { name: prefix + 'TurnStatus' })
registerEnumType(VictoryType, { name: prefix + 'VictoryType' })
registerEnumType(VoteValue, { name: prefix + 'VoteValue' })

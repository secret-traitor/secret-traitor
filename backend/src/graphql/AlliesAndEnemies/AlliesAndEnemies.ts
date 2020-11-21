import {
    FieldResolver,
    ObjectType,
    registerEnumType,
    Resolver,
    Root,
} from 'type-graphql'

import { GameId, GameType } from '@entities/Game'
import { PlayerId } from '@entities/Player'
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
import { AlliesAndEnemiesVictoryStatus } from '@graphql/AlliesAndEnemies/VictoryStatus'
import { GameState, IGameState } from '@graphql/GameState'
import { DescriptiveError, ApiResponse } from '@shared/api'

import { BaseAlliesAndEnemiesResolver } from './resolver'

@ObjectType({ implements: [GameState] })
export class AlliesAndEnemiesGameState extends GameState {
    constructor(playerId: PlayerId, gameId: GameId) {
        super(playerId, gameId, GameType.AlliesNEnemies)
    }
}

@Resolver(() => AlliesAndEnemiesGameState)
export class AlliesAndEnemiesGameStateResolver extends BaseAlliesAndEnemiesResolver {
    @FieldResolver(() => BoardState)
    async board(
        @Root() { gameId, playerId }: IGameState
    ): Promise<ApiResponse<BoardState>> {
        try {
            const { state } = await this.getActiveViewingPlayerState({
                gameId,
                playerId,
            })
            return {
                ally: {
                    cards: state.board.ally,
                    maxCards: state.config.victory.allyCards,
                },
                enemy: {
                    cards: state.board.enemy,
                    maxCards: state.config.victory.enemyCards,
                },
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
        @Root() { gameId, playerId }: IGameState
    ): Promise<ApiResponse<AlliesAndEnemiesPlayer>> {
        try {
            const { state } = await this.getActiveViewingPlayerState({
                gameId,
                playerId,
            })
            const playerState = state.players().find((p) => p.id === playerId)
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
        @Root() { gameId, playerId }: IGameState
    ): Promise<AlliesAndEnemiesPlayer[]> {
        try {
            const { state } = await this.getActiveViewingPlayerState({
                gameId,
                playerId,
            })
            return state.players()
        } catch (e) {
            if (e instanceof DescriptiveError) {
                return []
            }
            throw e
        }
    }

    @FieldResolver(() => CurrentTurn)
    async currentTurn(
        @Root() { gameId, playerId }: IGameState
    ): Promise<CurrentTurnRoot> {
        return await this.getActiveViewingPlayerState({ gameId, playerId })
    }

    @FieldResolver(() => AlliesAndEnemiesVictoryStatus, { nullable: true })
    async victoryStatus(
        @Root() { gameId, playerId }: IGameState
    ): Promise<Victory | null> {
        const { state } = await this.getActiveViewingPlayerState({
            gameId,
            playerId,
        })
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

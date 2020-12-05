import {
    Arg,
    Ctx,
    FieldResolver,
    ID,
    ObjectType,
    registerEnumType,
    Resolver,
    Root,
} from 'type-graphql'

import { GameId, GameType, IGame } from 'src/entities/Game'
import { PlayerId } from 'src/entities/Player'
import {
    ActiveAlliesAndEnemiesState,
    BoardAction,
    Faction,
    PlayerRole,
    PlayerStatus,
    TurnStatus,
    Victory,
    VictoryType,
    VoteValue,
} from 'src/entities/AlliesAndEnemies'

import { AlliesAndEnemiesVictoryStatus } from 'src/graphql/AlliesAndEnemies/VictoryStatus'
import { GameState, IGameState } from 'src/graphql/GameState'
import { DescriptiveError, ApiResponse } from 'src/shared/api'
import Context from 'src/shared/Context'

import { AlliesAndEnemiesPlayer } from './Player'
import { BoardState } from './BoardState'
import { CurrentTurn } from './CurrentTurn'

@ObjectType({ implements: [GameState] })
export class AlliesAndEnemiesGameState extends GameState {
    constructor(playerId: PlayerId, gameId: GameId) {
        super(playerId, gameId, GameType.AlliesNEnemies)
    }
}

@Resolver(() => AlliesAndEnemiesGameState)
class AlliesAndEnemiesGameStateResolver {
    @FieldResolver(() => BoardState)
    async board(
        @Root() { gameId, viewingPlayerId }: IGameState,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ApiResponse<BoardState>> {
        try {
            const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
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
        @Root() { gameId, viewingPlayerId }: IGameState,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ApiResponse<AlliesAndEnemiesPlayer>> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        return state.viewingPlayer
    }

    @FieldResolver(() => [AlliesAndEnemiesPlayer])
    async players(
        @Root() { gameId, viewingPlayerId }: IGameState,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<AlliesAndEnemiesPlayer[]> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
        return state.players()
    }

    @FieldResolver(() => CurrentTurn)
    async currentTurn(
        @Root() { gameId, viewingPlayerId }: IGameState,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<ActiveAlliesAndEnemiesState> {
        return await alliesAndEnemies.load(gameId, viewingPlayerId)
    }

    @FieldResolver(() => AlliesAndEnemiesVictoryStatus, { nullable: true })
    async victoryStatus(
        @Root() { gameId, viewingPlayerId }: IGameState,
        @Ctx() { dataSources: { alliesAndEnemies } }: Context
    ): Promise<Victory | null> {
        const state = await alliesAndEnemies.load(gameId, viewingPlayerId)
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

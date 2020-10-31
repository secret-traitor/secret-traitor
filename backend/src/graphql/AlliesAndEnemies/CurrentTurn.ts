import { Field, FieldResolver, ObjectType, Resolver, Root } from 'type-graphql'

import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies/Player'
import { BoardAction, TurnStatus } from '@games/AlliesAndEnemies'
import {
    BaseAlliesAndEnemiesResolver,
    ViewingPlayerState,
} from '@graphql/AlliesAndEnemies/resolver'
import { Inject } from 'typedi'
import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { ApiResponse, DescriptiveError } from '@shared/api'
import { Card } from '@graphql/AlliesAndEnemies/Card'

export type CurrentTurnRoot = ViewingPlayerState

@ObjectType()
export class CurrentTurn {}

@Resolver(() => CurrentTurn)
class CurrentTurnResolver extends BaseAlliesAndEnemiesResolver {
    constructor(
        @Inject('AlliesAndEnemies')
        protected readonly gameStateDao: IAlliesAndEnemiesDao,
        @Inject('GamePlayers') protected readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') protected readonly gameDao: IGameDao,
        @Inject('Players') protected readonly playerDao: IPlayerDao
    ) {
        super()
    }

    @FieldResolver(() => BoardAction, { nullable: true })
    action(@Root() { state }: CurrentTurnRoot): BoardAction | null {
        return state.currentRound.action || null
    }

    @FieldResolver(() => Number)
    consecutiveFailedElections(@Root() { state }: CurrentTurnRoot): number {
        return state.currentRound.consecutiveFailedElections
    }

    @FieldResolver(() => Boolean)
    elected(@Root() { state }: CurrentTurnRoot): boolean {
        return state.currentRound.elected || false
    }

    @FieldResolver(() => Boolean)
    enableVeto(@Root() { state }: CurrentTurnRoot): boolean {
        return state.currentRound.enableVeto || false
    }

    @FieldResolver(() => [Card], { nullable: true })
    firstHand(
        @Root() { state, viewingPlayer }: CurrentTurnRoot
    ): ApiResponse<[Card, Card, Card] | null> {
        if (state.currentRound.position === viewingPlayer.position) {
            return state.currentRound.firstHand || null
        }
        return null
    }

    @FieldResolver(() => AlliesAndEnemiesPlayer, { nullable: true })
    nominatedPlayer(
        @Root() { state, viewingPlayer }: CurrentTurnRoot
    ): ApiResponse<AlliesAndEnemiesPlayer | null> {
        if (!state.currentRound.nomination) {
            return null
        }
        const player = state
            .players(viewingPlayer)
            .find((p) => p.id === state.currentRound.nomination)
        if (!player) {
            return new DescriptiveError(
                'Unable to look up nominated player.',
                'Nominated player with this id does not exist.'
            )
        }
        return player
    }

    @FieldResolver(() => Number)
    number(@Root() { state }: CurrentTurnRoot): number {
        return state.currentRound.number
    }

    @FieldResolver(() => Number)
    position(@Root() { state }: CurrentTurnRoot): number {
        return state.currentRound.position
    }

    @FieldResolver(() => [Card], { nullable: true })
    secondHand(
        @Root() { state, viewingPlayer }: CurrentTurnRoot
    ): ApiResponse<[Card, Card] | null> {
        if (state.currentRound.nomination === viewingPlayer.id) {
            return state.currentRound.secondHand || null
        }
        return null
    }

    @FieldResolver(() => Boolean)
    specialElection(@Root() { state }: CurrentTurnRoot): boolean {
        return state.currentRound.specialElection || false
    }

    @FieldResolver(() => TurnStatus)
    status(@Root() { state }: CurrentTurnRoot): TurnStatus {
        return state.currentRound.status
    }

    @FieldResolver(() => AlliesAndEnemiesPlayer)
    waitingOn(
        @Root() { state, viewingPlayer }: CurrentTurnRoot
    ): ApiResponse<AlliesAndEnemiesPlayer> {
        const player = state
            .players(viewingPlayer)
            .find((p) => p.position === state.currentRound.position)
        if (!player) {
            return new DescriptiveError(
                'Unable to look up current player.',
                'Player for current round does not exist.'
            )
        }
        return player
    }

    @FieldResolver(() => [AlliesAndEnemiesPlayer])
    ineligibleNominations(
        @Root() { state, viewingPlayer }: CurrentTurnRoot
    ): ApiResponse<AlliesAndEnemiesPlayer[]> {
        return state.ineligibleNominations(viewingPlayer)
    }
}

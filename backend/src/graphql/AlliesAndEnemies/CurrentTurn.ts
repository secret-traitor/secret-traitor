import { FieldResolver, ObjectType, Resolver, Root } from 'type-graphql'

import {
    ActiveAlliesAndEnemiesState,
    BoardAction,
    TurnStatus,
} from 'src/entities/AlliesAndEnemies'
import { AlliesAndEnemiesPlayer } from 'src/graphql/AlliesAndEnemies/Player'

import { Card } from 'src/graphql/AlliesAndEnemies/Card'
import { ApiResponse, DescriptiveError } from 'src/shared/api'

@ObjectType()
export class CurrentTurn {}

@Resolver(() => CurrentTurn)
class CurrentTurnResolver {
    @FieldResolver(() => BoardAction, { nullable: true })
    action(@Root() state: ActiveAlliesAndEnemiesState): BoardAction | null {
        return state.currentRound.action || null
    }

    @FieldResolver(() => Number)
    consecutiveFailedElections(
        @Root() state: ActiveAlliesAndEnemiesState
    ): number {
        return state.currentRound.consecutiveFailedElections
    }

    @FieldResolver(() => Boolean)
    elected(@Root() state: ActiveAlliesAndEnemiesState): boolean {
        return state.currentRound.elected || false
    }

    @FieldResolver(() => Boolean)
    enableVeto(@Root() state: ActiveAlliesAndEnemiesState): boolean {
        return state.currentRound.enableVeto || false
    }

    @FieldResolver(() => [Card], { nullable: true })
    firstHand(
        @Root() state: ActiveAlliesAndEnemiesState
    ): ApiResponse<[Card, Card, Card] | null> {
        if (state.currentRound.position === state.viewingPlayer.position) {
            return state.currentRound.firstHand || null
        }
        return null
    }

    @FieldResolver(() => AlliesAndEnemiesPlayer, { nullable: true })
    nominatedPlayer(
        @Root() state: ActiveAlliesAndEnemiesState
    ): ApiResponse<AlliesAndEnemiesPlayer | null> {
        if (!state.currentRound.nomination) {
            return null
        }
        const player = state
            .players()
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
    number(@Root() { currentRound }: ActiveAlliesAndEnemiesState): number {
        return currentRound.number
    }

    @FieldResolver(() => Number)
    position(@Root() { currentRound }: ActiveAlliesAndEnemiesState): number {
        return currentRound.position
    }

    @FieldResolver(() => [Card], { nullable: true })
    secondHand(
        @Root() { currentRound, viewingPlayer }: ActiveAlliesAndEnemiesState
    ): ApiResponse<[Card, Card] | null> {
        if (currentRound.nomination === viewingPlayer.id) {
            return currentRound.secondHand || null
        }
        return null
    }

    @FieldResolver(() => Boolean)
    specialElection(
        @Root() { currentRound }: ActiveAlliesAndEnemiesState
    ): boolean {
        return currentRound.specialElection || false
    }

    @FieldResolver(() => TurnStatus)
    status(@Root() { currentRound }: ActiveAlliesAndEnemiesState): TurnStatus {
        return currentRound.status
    }

    @FieldResolver(() => AlliesAndEnemiesPlayer)
    waitingOn(
        @Root() state: ActiveAlliesAndEnemiesState
    ): ApiResponse<AlliesAndEnemiesPlayer> {
        const player = state
            .players()
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
        @Root() state: ActiveAlliesAndEnemiesState
    ): ApiResponse<AlliesAndEnemiesPlayer[]> {
        return state.ineligibleNominations()
    }
}

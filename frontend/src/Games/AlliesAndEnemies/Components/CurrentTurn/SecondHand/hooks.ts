import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

const SecondHandDiscardMutation = gql`
    mutation secondHand($gameId: ID!, $playerId: ID!, $index: Float!) {
        alliesAndEnemiesSecondHandDiscard(
            playerId: $playerId
            gameId: $gameId
            index: $index
        ) {
            timestamp
        }
    }
`

export type DiscardIndex = 0 | 1

export const useSecondHandDiscard = (
    gameId: string,
    playerId: string
): [(index: DiscardIndex) => Promise<ExecutionResult>, MutationResult] => {
    const [discardFn, results] = useMutation(SecondHandDiscardMutation)
    const discard = async (index: DiscardIndex) => {
        return await discardFn({ variables: { index, gameId, playerId } })
    }
    return [discard, results]
}

const CallVetoMutation = gql`
    mutation callVeto($gameId: ID!, $playerId: ID!) {
        alliesAndEnemiesCallVeto(playerId: $playerId, gameId: $gameId) {
            timestamp
        }
    }
`

export const useCallVeto = (
    gameId: string,
    playerId: string
): [() => Promise<ExecutionResult>, MutationResult] => {
    const [callVetoFn, results] = useMutation(CallVetoMutation, {
        variables: { gameId, playerId },
    })
    return [() => callVetoFn(), results]
}

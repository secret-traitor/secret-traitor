import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

const SecondHandDiscardMutation = gql`
    mutation secondHand($playId: ID!, $index: Float!) {
        alliesAndEnemiesSecondHandDiscard(playId: $playId, index: $index) {
            timestamp
        }
    }
`

export type DiscardIndex = 0 | 1

export const useSecondHandDiscard = (
    playId: string
): [(index: DiscardIndex) => Promise<ExecutionResult>, MutationResult] => {
    const [discardFn, results] = useMutation(SecondHandDiscardMutation)
    const discard = async (index: DiscardIndex) => {
        return await discardFn({ variables: { index, playId } })
    }
    return [discard, results]
}

const CallVetoMutation = gql`
    mutation callVeto($playId: ID!) {
        alliesAndEnemiesCallVeto(playId: $playId) {
            timestamp
        }
    }
`

export const useCallVeto = (
    playId: string
): [() => Promise<ExecutionResult>, MutationResult] => {
    const [callVetoFn, results] = useMutation(CallVetoMutation, {
        variables: { playId },
    })
    return [() => callVetoFn(), results]
}

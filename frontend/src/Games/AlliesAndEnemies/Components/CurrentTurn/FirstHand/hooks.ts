import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

const FirstHandDiscardMutation = gql`
    mutation firstHand($gameId: ID!, $playerId: ID!, $index: Float!) {
        alliesAndEnemiesFirstHandDiscard(
            gameId: $gameId
            playerId: $playerId
            index: $index
        ) {
            timestamp
        }
    }
`

export type DiscardIndex = 0 | 1 | 2

export const useFirstHandDiscard = (
    gameId: string,
    playerId: string
): [(index: DiscardIndex) => Promise<ExecutionResult>, MutationResult] => {
    const [discardFn, results] = useMutation(FirstHandDiscardMutation)
    const discard = async (index: DiscardIndex) => {
        return await discardFn({ variables: { index, gameId, playerId } })
    }
    return [discard, results]
}

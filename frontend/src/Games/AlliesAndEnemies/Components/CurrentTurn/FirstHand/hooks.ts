import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/client/react/types/types'
import { FetchResult } from '@apollo/client/link/core'

const FirstHandDiscardMutation = gql`
    mutation firstHand($playId: ID!, $index: Float!) {
        alliesAndEnemiesFirstHandDiscard(playId: $playId, index: $index) {
            timestamp
        }
    }
`

export type DiscardIndex = 0 | 1 | 2

export const useFirstHandDiscard = (
    playId: string
): [(index: DiscardIndex) => Promise<FetchResult>, MutationResult] => {
    const [discardFn, results] = useMutation(FirstHandDiscardMutation)
    const discard = async (index: DiscardIndex) => {
        return await discardFn({ variables: { index, playId } })
    }
    return [discard, results]
}

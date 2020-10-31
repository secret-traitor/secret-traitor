import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/client/react/types/types'
import { FetchResult } from '@apollo/client/link/core'

const VoteMutation = gql`
    mutation vote($playId: ID!, $vote: AlliesAndEnemiesVoteValue!) {
        alliesAndEnemiesVote(playId: $playId, vote: $vote) {
            timestamp
            ... on AlliesAndEnemiesVoteEvent {
                vote
            }
        }
    }
`

export const useVote = (
    playId: string
): [(vote: 'yes' | 'no') => Promise<FetchResult>, MutationResult] => {
    const [voteFn, results] = useMutation(VoteMutation)
    const vote = async (vote: 'yes' | 'no') => {
        if (vote === 'yes') {
            return await voteFn({ variables: { playId, vote: 'Yes' } })
        } else {
            return await voteFn({ variables: { playId, vote: 'No' } })
        }
    }
    return [vote, results]
}

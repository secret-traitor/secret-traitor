import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult, ExecutionResult } from '@apollo/react-common'

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
): [(vote: 'yes' | 'no') => Promise<ExecutionResult>, MutationResult] => {
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

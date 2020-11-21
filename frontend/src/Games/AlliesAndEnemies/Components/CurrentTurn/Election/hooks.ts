import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult, ExecutionResult } from '@apollo/react-common'
import { PlayerVote } from '../../../types'

const VoteMutation = gql`
    mutation vote(
        $gameId: ID!
        $playerId: ID!
        $vote: AlliesAndEnemiesVoteValue!
    ) {
        alliesAndEnemiesVote(
            playerId: $playerId
            gameId: $gameId
            vote: $vote
        ) {
            timestamp
        }
    }
`

export const useVote = (
    gameId: string,
    playerId: string
): [(vote: PlayerVote) => Promise<ExecutionResult>, MutationResult] => {
    const [voteFn, results] = useMutation(VoteMutation)
    const vote = async (vote: PlayerVote) => {
        return await voteFn({ variables: { gameId, playerId, vote } })
    }
    return [vote, results]
}

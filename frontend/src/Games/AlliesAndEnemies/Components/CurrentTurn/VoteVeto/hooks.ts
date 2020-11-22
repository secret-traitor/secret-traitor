import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

import { PlayerVote } from 'Games/AlliesAndEnemies/types'

const VetoVoteMutation = gql`
    mutation voteVeto(
        $gameId: ID!
        $playerId: ID!
        $vote: AlliesAndEnemiesVoteValue!
    ) {
        alliesAndEnemiesVetoVote(
            playerId: $playerId
            gameId: $gameId
            vote: $vote
        ) {
            timestamp
        }
    }
`
export const useVoteVeto = (
    gameId: string,
    playerId: string
): [(vote: PlayerVote) => Promise<ExecutionResult>, MutationResult] => {
    const [voteMutation, results] = useMutation(VetoVoteMutation)
    const vote = (vote: PlayerVote) =>
        voteMutation({
            variables: { gameId, playerId, vote },
        })
    return [vote, results]
}

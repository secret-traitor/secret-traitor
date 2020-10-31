import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult, ExecutionResult } from '@apollo/react-common'

import { Player } from 'types/Player'

const NominateSpecialElectionMutation = gql`
    mutation alliesAndEnemiesSpecialElection(
        $playId: ID!
        $selectedPlayerId: ID!
    ) {
        alliesAndEnemiesExecutePlayer(
            playerId: $selectedPlayerId
            playId: $playId
        ) {
            timestamp
        }
    }
`

export const useExecutePlayer = (
    playId: string
): [(player: Player) => Promise<ExecutionResult>, MutationResult] => {
    const [executeFn, results] = useMutation(NominateSpecialElectionMutation)
    const execute = async (player: Player) =>
        await executeFn({
            variables: { playId, selectedPlayerId: player.id },
        })
    return [execute, results]
}

import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult, ExecutionResult } from '@apollo/react-common'

import { Player } from 'Types/Player'

const NominateSpecialElectionMutation = gql`
    mutation alliesAndEnemiesSpecialElection(
        $gameId: ID!
        $playerId: ID!
        $executePlayerId: ID!
    ) {
        alliesAndEnemiesExecutePlayer(
            playerId: $playerId
            gameId: $gameId
            executePlayerId: $executePlayerId
        ) {
            timestamp
        }
    }
`

export const useExecutePlayer = (
    gameId: string,
    playerId: string
): [(player: Player) => Promise<ExecutionResult>, MutationResult] => {
    const [executeFn, results] = useMutation(NominateSpecialElectionMutation)
    const execute = async (player: Player) =>
        await executeFn({
            variables: { gameId, playerId, executePlayerId: player.id },
        })
    return [execute, results]
}

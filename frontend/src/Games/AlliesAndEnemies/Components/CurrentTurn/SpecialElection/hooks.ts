import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

import { Player } from 'Types/Player'

const NominateSpecialElectionMutation = gql`
    mutation alliesAndEnemiesSpecialElection(
        $gameId: ID!
        $playerId: ID!
        $selectedPlayerId: ID!
    ) {
        alliesAndEnemiesSpecialElection(
            playerId: $playerId
            gameId: $gameId
            selectedPlayerId: $selectedPlayerId
        ) {
            timestamp
        }
    }
`

export const useNominateSpecialElection = (
    gameId: string,
    playerId: string
): [(player: Player) => Promise<ExecutionResult>, MutationResult] => {
    const [nominateFn, results] = useMutation(NominateSpecialElectionMutation)
    const nominate = async (player: Player) =>
        await nominateFn({
            variables: { gameId, playerId, selectedPlayerId: player.id },
        })
    return [nominate, results]
}

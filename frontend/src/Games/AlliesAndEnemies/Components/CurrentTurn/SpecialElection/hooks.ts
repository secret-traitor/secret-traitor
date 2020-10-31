import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

import { Player } from 'types/Player'

const NominateSpecialElectionMutation = gql`
    mutation alliesAndEnemiesSpecialElection(
        $playId: ID!
        $nominatedPlayerId: ID!
    ) {
        alliesAndEnemiesSpecialElection(
            playerId: $nominatedPlayerId
            playId: $playId
        ) {
            ... on AlliesAndEnemiesSpecialElectionEvent {
                nomination {
                    id
                    nickname
                    position
                    role
                }
            }
        }
    }
`

export const useNominateSpecialElection = (
    playId: string
): [(player: Player) => Promise<ExecutionResult>, MutationResult] => {
    const [nominateFn, results] = useMutation(NominateSpecialElectionMutation)
    const nominate = async (player: Player) =>
        await nominateFn({
            variables: { playId, nominatedPlayerId: player.id },
        })
    return [nominate, results]
}

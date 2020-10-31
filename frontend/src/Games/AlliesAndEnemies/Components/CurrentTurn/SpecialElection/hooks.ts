import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/client/react/types/types'
import { FetchResult } from '@apollo/client/link/core'

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
): [(player: Player) => Promise<FetchResult>, MutationResult] => {
    const [nominateFn, results] = useMutation(NominateSpecialElectionMutation)
    const nominate = async (player: Player) =>
        await nominateFn({
            variables: { playId, nominatedPlayerId: player.id },
        })
    return [nominate, results]
}

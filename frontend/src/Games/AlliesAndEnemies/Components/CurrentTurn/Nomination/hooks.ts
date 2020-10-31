import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult } from '@apollo/client/react/types/types'
import { FetchResult } from '@apollo/client/link/core'

import { Player } from 'types/Player'

const NominationMutation = gql`
    mutation nominatePlayer($playId: ID!, $nominatedPlayerId: ID!) {
        alliesAndEnemiesNominate(
            nominatedPlayerId: $nominatedPlayerId
            playId: $playId
        ) {
            ... on AlliesAndEnemiesNominationEvent {
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

export const useNominate = (
    playId: string
): [(player: Player) => Promise<FetchResult>, MutationResult] => {
    const [nominateFn, results] = useMutation(NominationMutation)
    const nominate = async (player: Player) =>
        await nominateFn({
            variables: { playId, nominatedPlayerId: player.id },
        })
    return [nominate, results]
}

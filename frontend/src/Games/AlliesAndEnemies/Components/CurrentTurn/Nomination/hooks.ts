import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MutationResult, ExecutionResult } from '@apollo/react-common'

import { Player } from 'types/Player'

const NominationMutation = gql`
    mutation nominatePlayer(
        $gameId: ID!
        $playerId: ID!
        $nominatedPlayerId: ID!
    ) {
        alliesAndEnemiesNominate(
            playerId: $playerId
            gameId: $gameId
            nominatedPlayerId: $nominatedPlayerId
        ) {
            timestamp
        }
    }
`

export const useNominate = (
    gameId: string,
    playerId: string
): [(player: Player) => Promise<ExecutionResult>, MutationResult] => {
    const [nominateFn, results] = useMutation(NominationMutation)
    const nominate = async (player: Player) =>
        await nominateFn({
            variables: { gameId, playerId, nominatedPlayerId: player.id },
        })
    return [nominate, results]
}

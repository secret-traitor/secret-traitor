import { gql } from 'apollo-boost'
import { MutationResult, ExecutionResult } from '@apollo/react-common'

import { Player } from 'Types/Player'
import { useGameMutation } from 'Hooks/games'

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
    const [nominateFn, results] = useGameMutation(NominationMutation, gameId)
    const nominate = async (player: Player) =>
        await nominateFn({
            variables: { gameId, playerId, nominatedPlayerId: player.id },
        })
    return [nominate, results]
}

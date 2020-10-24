import { FetchResult } from '@apollo/client/link/core'
import { gql } from 'apollo-boost'
import { MutationResult, QueryResult } from '@apollo/client/react/types/types'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { Game, GameType } from 'types/Game'
import { GameDescription } from 'types/GameDescription'

const GAME_TYPES_QUERY = gql`
    query gameTypes {
        gameTypes {
            type
            displayName
            description
        }
    }
`
export const useGameTypes = (): QueryResult & {
    gameTypes: GameDescription[]
} => {
    const results = useQuery(GAME_TYPES_QUERY)
    const gameTypes = (results.data?.gameTypes as GameDescription[]) || []
    return { ...results, gameTypes }
}
const CREATE_MUTATION = gql`
    mutation createGame($playerId: ID!, $gameType: GameType!) {
        game: createGame(playerId: $playerId, gameType: $gameType) {
            id
            status
            type
        }
    }
`
export const useCreateGame = (
    playerId: string
): [
    (type: GameType) => Promise<FetchResult>,
    MutationResult & { game?: Game }
] => {
    const [createMutation, result] = useMutation(CREATE_MUTATION)
    const create = (type: GameType) =>
        createMutation({
            variables: { playerId, gameType: type },
        })
    const game = result.data?.game as Game
    return [create, { ...result, game }]
}

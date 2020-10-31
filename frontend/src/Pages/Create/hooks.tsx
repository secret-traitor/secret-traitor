import { ExecutionResult } from '@apollo/react-common'
import { gql } from 'apollo-boost'
import { MutationResult, QueryResult } from '@apollo/react-common'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { Game, GameType } from 'types/Game'
import { GameDescription } from 'types/GameDescription'

const GameTypesQuery = gql`
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
    const results = useQuery(GameTypesQuery)
    const gameTypes = (results.data?.gameTypes as GameDescription[]) || []
    return { ...results, gameTypes }
}

const CreateMutation = gql`
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
    (type: GameType) => Promise<ExecutionResult>,
    MutationResult & { game?: Game }
] => {
    const [createMutation, result] = useMutation(CreateMutation)
    const create = (type: GameType) =>
        createMutation({
            variables: { playerId, gameType: type },
        })
    const game = result.data?.game as Game
    return [create, { ...result, game }]
}

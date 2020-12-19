import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
    ExecutionResult,
    MutationResult,
    QueryResult,
} from '@apollo/react-common'

import { Game, GameType } from 'types/Game'
import { usePollingQuery } from 'hooks/apollo'
import { GameDescription } from 'types/GameDescription'

const GamesQuery = gql`
    query joinableGames {
        games: joinableGames {
            id
            status
            type
            players {
                host
                id
                nickname
            }
        }
    }
`
export const usePollGames = (): QueryResult & { games: Game[] } => {
    const result = usePollingQuery(GamesQuery)
    const games: Game[] = result.data?.games as Game[]
    return { ...result, games }
}

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
    (type: GameType) => Promise<ExecutionResult & { game?: Game }>,
    MutationResult
] => {
    const [createMutation, results] = useMutation(CreateMutation)
    const create = async (type: GameType) => {
        console.log({ type }, type.toString())
        const results = await createMutation({
            variables: { playerId, gameType: type.toString() },
        })
        return {
            ...results,
            game: results.data?.game as Game,
        }
    }
    return [create, results]
}

const JoinGameMutation = gql`
    mutation joinGame(
        $gameId: String!
        $playerId: String!
        $playerNickname: String!
    ) {
        joinGame(
            gameId: $gameId
            playerId: $playerId
            playerNickname: $playerNickname
        ) {
            game {
                id
                status
                type
                players {
                    id
                    nickname
                }
            }
        }
    }
`

export type JoinGameFn = (
    gameId: string,
    playerNickname: string
) => Promise<ExecutionResult & { game: Game }>

export const useJoinGame = (playerId: string): [JoinGameFn, MutationResult] => {
    const [joinFn, results] = useMutation(JoinGameMutation, {
        onError: () => ({}),
    })
    const join: JoinGameFn = async (gameId, playerNickname) => {
        const results = await joinFn({
            variables: { gameId, playerId, playerNickname },
        })
        return {
            ...results,
            game: results?.data?.joinGame?.game,
        }
    }
    return [join, results]
}

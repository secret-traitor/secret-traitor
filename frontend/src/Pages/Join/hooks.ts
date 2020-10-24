import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { Game } from 'types/Game'
import { Player } from 'types/Player'
import { MutationResult, QueryResult } from '@apollo/client/react/types/types'
import { FetchResult } from '@apollo/client/link/core'

const GAME_PLAYERS_QUERY = gql`
    query gameWithPlayers($gameId: ID!) {
        game(id: $gameId) {
            id
            status
            type
            players {
                id
                nickname
            }
        }
    }
`

export const useGameWithPlayers = (
    gameId: string,
    playerId: string
): QueryResult & { game?: Game; player?: Player } => {
    const result = useQuery(GAME_PLAYERS_QUERY, {
        variables: { gameId, playerId },
        fetchPolicy: 'no-cache',
    })
    const game = result.data?.game as Game
    const players = (result.data?.game?.players as Player[]) || []
    const player = players.find((player) => player.id === playerId)

    console.log({ game, players, player, playerId })
    return {
        ...result,
        game,
        player,
    }
}

const JOIN_GAME_MUTATION = gql`
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

export type JoinGameProps = {
    gameId: string
    playerId: string
    playerNickname: string
}

export const useJoinGame = (): [
    (variables: JoinGameProps) => Promise<FetchResult>,
    MutationResult
] => {
    const [createMutation, results] = useMutation(JOIN_GAME_MUTATION)
    const join = (variables: JoinGameProps) => createMutation({ variables })
    return [join, results]
}

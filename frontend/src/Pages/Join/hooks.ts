import find from 'lodash/find'
import get from 'lodash/get'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { Game, Player } from './types'

const GAME_PLAYERS_QUERY = gql`
    query gameWithPlayers($gameCode: String!) {
        game(code: $gameCode) {
            id
            status
            players {
                id
                code
                nickname
            }
        }
    }
`

export const useGameWithPlayers = (
    gameCode: string,
    playerCode: string
): [{ game: Game; player: Player | null }, boolean, any, () => void] => {
    const { data, loading, error, refetch } = useQuery(GAME_PLAYERS_QUERY, {
        variables: { gameCode, playerCode },
        fetchPolicy: 'no-cache',
    })
    const game = get(data, 'game') as Game
    const players = get(data, 'game.players', []) as Player[]
    const player = find(players, (player) => player.code === playerCode) || null
    return [{ game, player }, loading, error, refetch]
}

const JOIN_GAME_MUTATION = gql`
    mutation joinGame(
        $gameCode: String!
        $playerCode: String!
        $playerNickname: String!
    ) {
        joinGame(
            gameCode: $gameCode
            playerCode: $playerCode
            playerNickname: $playerNickname
        ) {
            gameState {
                game {
                    code
                    status
                }
                player {
                    code
                    nickname
                }
            }
        }
    }
`

export type JoinGameProps = {
    gameCode: string
    playerCode: string
    playerNickname: string
}

export const useJoinGame = () => {
    const [createMutation, { called, loading, error, data }] = useMutation(
        JOIN_GAME_MUTATION
    )
    const join = (variables: JoinGameProps) => createMutation({ variables })
    return { join, data, loading, error, called }
}

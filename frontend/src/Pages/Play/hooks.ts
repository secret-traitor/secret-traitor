import find from 'lodash/find'
import get from 'lodash/get'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

import { Player, Game } from './types'

const GAME_PLAYER_QUERY = gql`
    query gamePlayer($playerCode: String!, $gameCode: String!) {
        gamePlayer(playerCode: $playerCode, gameCode: $gameCode) {
            player {
                nickname
            }
            game {
                status
            }
        }
    }
`

export const useGamePlayer = (
    gameCode: string,
    playerCode: string
): [{ game: Game; player: Player }, boolean, any, () => void] => {
    const { data, loading, error, refetch } = useQuery(GAME_PLAYER_QUERY, {
        variables: { gameCode, playerCode },
    })
    const game: Game = get(data, 'gamePlayer.game') as Game
    const player: Player = get(data, 'gamePlayer.player') as Player
    return [{ game, player }, loading, error, refetch]
}

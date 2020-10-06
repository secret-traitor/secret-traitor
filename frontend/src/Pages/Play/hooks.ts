import get from 'lodash/get'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

import { Player, Game } from './types'
import { QueryResult } from '@apollo/react-common'

const FRAG = gql`
    fragment JoinGameEventFragment on JoinGameEvent {
        game {
            status
            hosts {
                id
                nickname
            }
            players {
                id
                nickname
            }
        }
    }
`

const GAME_PLAYER_QUERY = gql`
    query gamePlayer($playerCode: String!, $gameCode: String!) {
        gamePlayer(playerCode: $playerCode, gameCode: $gameCode) {
            ... on GamePlayer {}
        }
    }


`

type UseGamePlayer = QueryResult & {
    game?: Game
    player?: Player
}

export const usePlayGame = (
    gameCode: string,
    playerCode: string
): UseGamePlayer => {
    const result = useQuery(GAME_PLAYER_QUERY, {
        variables: { gameCode, playerCode },
        fetchPolicy: 'no-cache',
    })
    const { subscribeToMore } = result
    // subscribeToMore({})
    let game: Game = get(result, 'data.gamePlayer.game') as Game
    let player: Player = get(result, 'data.gamePlayer.player') as Player
    return { ...result, game, player }
}

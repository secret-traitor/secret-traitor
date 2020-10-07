import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

import { QueryResult } from '@apollo/react-common'
import { Game } from 'types/Game'
import { Player } from 'types/Player'

// const FRAG = gql`
//     fragment PlayEventFragment on PlayEvent {
//         game {
//             id
//             status
//             hosts {
//                 id
//                 code
//                 nickname
//                 __typename
//             }
//             players {
//                 id
//                 code
//                 nickname
//                 __typename
//             }
//             __typename
//         }
//     }
// `

const PLAY_QUERY = gql`
    query playQuery($playerId: ID!, $gameId: ID!) {
        play(playerId: $playerId, gameId: $gameId) {
            ... on PlayEvent {
                game {
                    id
                    status
                    hosts {
                        id
                        code
                        nickname
                        __typename
                    }
                    players {
                        id
                        code
                        nickname
                        __typename
                    }
                    __typename
                }
            }
        }
    }
`

const PLAY_SUBSCRIPTION = gql`
    subscription playSubscription($playerId: ID!, $gameId: ID!) {
        play(playerId: $playerId, gameId: $gameId) {
            ... on PlayEvent {
                game {
                    id
                    status
                    hosts {
                        id
                        code
                        nickname
                        __typename
                    }
                    players {
                        id
                        code
                        nickname
                        __typename
                    }
                    __typename
                }
            }
        }
    }
`

type PlayGame = QueryResult & {
    game?: Game
    players?: Player[]
    hosts?: Player[]
}

export const usePlayGame = (gameId?: string, playerId?: string): PlayGame => {
    const variables = { gameId, playerId }
    const result = useQuery(PLAY_QUERY, {
        variables,
        fetchPolicy: 'no-cache',
        skip: !gameId || !playerId,
    })
    let game = result?.data?.play?.game as Game
    let players = result?.data?.play?.game.players as Player[]
    let hosts = result?.data?.play?.game.hosts as Player[]
    if (gameId && playerId) {
        result.subscribeToMore({
            document: PLAY_SUBSCRIPTION,
            variables,
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev
                game = subscriptionData?.data?.play?.game as Game
                players = subscriptionData?.data?.play?.game.players as Player[]
                hosts = subscriptionData?.data?.play?.game.hosts as Player[]
                return Object.assign({}, prev, subscriptionData)
            },
        })
    }

    console.log(players?.map((p) => p.nickname))
    return { ...result, game, players, hosts }
}

const GAME_PLAYER_QUERY = gql`
    query gamePlayer($playerCode: String!, $gameCode: String!) {
        gamePlayer(playerCode: $playerCode, gameCode: $gameCode) {
            player {
                id
                nickname
            }
            game {
                id
            }
        }
    }
`

type GamePlayer = QueryResult & {
    gameId?: string
    playerId?: string
    playerNickname?: string
}

export const useGamePlayer = (
    gameCode: string,
    playerCode: string
): GamePlayer => {
    const result = useQuery(GAME_PLAYER_QUERY, {
        variables: { gameCode, playerCode },
        skip: !gameCode || !playerCode,
    })
    let gameId = result?.data?.gamePlayer?.game.id as string
    let playerId = result?.data?.gamePlayer?.player.id as string
    let playerNickname = result?.data?.gamePlayer?.player.nickname as string
    return { ...result, gameId, playerId, playerNickname }
}

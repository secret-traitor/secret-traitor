import { gql } from 'apollo-boost'
import { useEffect } from 'react'
import {
    useQuery,
    QueryResult,
    useMutation,
    MutationResult,
} from '@apollo/react-hooks'
import find from 'lodash/find'

import { Game, GameState } from 'types/Game'
import { HostPlayer, Player } from 'types/Player'

const mapHostPlayers = (data?: any): HostPlayer[] => {
    const players = data?.play?.game.players as Player[]
    const hosts = data?.play?.game.hosts as Player[]
    const hostIds = hosts?.map((h) => h.id)
    return players?.map((p) => ({
        ...p,
        host: hostIds.includes(p.id) as boolean,
    })) as HostPlayer[]
}

const FRAG = gql`
    fragment AlliesNEnemiesGameStateFragment on AlliesNEnemiesGameState {
        currentTurn {
            number
            status
            waitingOn {
                id
                nickname
            }
        }
        board {
            actions
            ally {
                cards {
                    suit
                }
                maxCards
            }
            enemy {
                cards {
                    suit
                }
                maxCards
            }
        }
        player {
            id
        }
        game {
            id
            code
            type
            status
            hosts {
                id
                code
                nickname
            }
            players {
                id
                code
                nickname
            }
        }
    }
`

const PLAY_QUERY = gql`
    query playQuery($playId: ID!) {
        play(playId: $playId) {
            ...AlliesNEnemiesGameStateFragment
        }
    }
    ${FRAG}
`

const PLAY_SUBSCRIPTION = gql`
    subscription playSubscription($playId: ID!, $gameId: ID!) {
        play(playId: $playId, gameId: $gameId) {
            timestamp
            gameState {
                ...AlliesNEnemiesGameStateFragment
            }
        }
    }
    ${FRAG}
`

type PlayGame = QueryResult & {
    game?: Game
    players?: HostPlayer[]
    player?: HostPlayer
    state: GameState
}

export const usePlayGame = (gameId?: string, playId?: string): PlayGame => {
    const result = useQuery(PLAY_QUERY, {
        variables: { playId },
        skip: !gameId || !playId,
    })

    useEffect(() => {
        let unsubscribe: (() => void) | undefined
        if (gameId && playId) {
            unsubscribe = result?.subscribeToMore({
                document: PLAY_SUBSCRIPTION,
                variables: { gameId, playId },
                updateQuery: (prev, { subscriptionData }) => {
                    let data = {
                        ...prev,
                        play: {
                            ...prev?.play,
                            ...subscriptionData?.data?.play?.gameState,
                        },
                    }
                    console.log({ prev, data })
                    return data
                },
            })
        }
        if (unsubscribe) return unsubscribe
    }, [gameId, playId, result])

    const game = result?.data?.play?.game
    const player = result?.data?.play?.player
    const players = mapHostPlayers(result?.data)
    const state = result?.data?.play

    return {
        ...result,
        game: game as Game,
        player: find(players, (p) => p.id === player?.id),
        players: players as HostPlayer[],
        state: state as GameState,
    }
}

const GAME_PLAYER_QUERY = gql`
    query gamePlayer($playerCode: String!, $gameCode: String!) {
        gamePlayer(playerCode: $playerCode, gameCode: $gameCode) {
            id
            isHost
            player {
                id
                code
                nickname
            }
            game {
                id
                code
                type
                status
            }
        }
    }
`

type GamePlayer = QueryResult & {
    gameId?: string
    playId?: string
}

export const useGameDetails = (
    gameCode: string,
    playerCode: string
): GamePlayer => {
    const result = useQuery(GAME_PLAYER_QUERY, {
        variables: { gameCode, playerCode },
        skip: !gameCode || !playerCode,
        fetchPolicy: 'no-cache',
    })
    const gameId = result?.data?.gamePlayer?.game?.id
    const playId = result?.data?.gamePlayer?.id as string
    return { ...result, gameId, playId }
}

const START_GAME_MUTATION = gql`
    mutation startGame($playId: ID!) {
        setGameStatus(playId: $playId, status: InProgress) {
            timestamp
            status: new
        }
    }
`

type StartGame = {
    startGame: () => void
    result: MutationResult
}

export const useStartGame = (playId?: string) => {
    const result = useMutation(START_GAME_MUTATION)
    const [startMutation] = result
    return {
        startGame: () => startMutation({ variables: { playId } }),
        result,
    }
}

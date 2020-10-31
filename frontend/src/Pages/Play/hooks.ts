import { gql } from 'apollo-boost'
import { useEffect } from 'react'
import { ExecutionResult, MutationResult, QueryResult } from '@apollo/react-common'
import { useQuery, useMutation } from '@apollo/react-hooks'
import find from 'lodash/find'

import { Game, GameState } from 'types/Game'
import { HostPlayer, Player } from 'types/Player'
import { AlliesAndEnemiesGameStateFragment } from 'Games/AlliesAndEnemies'

const mapHostPlayers = (game?: any): HostPlayer[] => {
    const players = game?.players as Player[]
    const hostIds = game?.hosts?.map((host: Partial<Player>) => host?.id)
    return players?.map((p) => ({
        ...p,
        host: hostIds.includes(p.id) as boolean,
    })) as HostPlayer[]
}

const GameFragment = gql`
    fragment GameFragment on Game {
        id
        type
        status
        hosts {
            id
        }
        players {
            id
            nickname
        }
    }
`

const GameQuery = gql`
    query playQuery($gameId: ID!, $playId: ID!) {
        game(id: $gameId) {
            ...GameFragment
            state(playId: $playId) {
                ...AlliesAndEnemiesGameStateFragment
            }
        }
    }
    ${GameFragment}
    ${AlliesAndEnemiesGameStateFragment}
`

const GameSubscription = gql`
    subscription playSubscription($gameId: ID!, $playId: ID!) {
        play(gameId: $gameId) {
            game {
                ...GameFragment
                state(playId: $playId) {
                    ...AlliesAndEnemiesGameStateFragment
                }
            }
            timestamp
            ... on JoinGameEvent {
                joined {
                    nickname
                }
            }
            ... on GameStatusEvent {
                changedFrom
                changedTo
            }
            __typename
        }
    }
    ${GameFragment}
    ${AlliesAndEnemiesGameStateFragment}
`

type PlayGame = QueryResult & {
    game?: Game
    players?: HostPlayer[]
    player?: HostPlayer
    state?: GameState
}

export const usePlayGame = (
    gameId: string,
    playerId: string,
    playId?: string
): PlayGame => {
    const result = useQuery(GameQuery, {
        variables: { gameId, playId },
        skip: !gameId || !playId,
    })
    useEffect(() => {
        let unsubscribe: (() => void) | undefined
        if (gameId && playId) {
            unsubscribe = result?.subscribeToMore({
                document: GameSubscription,
                variables: { gameId, playId },
                updateQuery: (prev, { subscriptionData }) => {
                    console.log('subscriptionData:', subscriptionData?.data)
                    const { game, state } = subscriptionData?.data?.play
                    return { game, state }
                },
            })
        }
        if (unsubscribe) return unsubscribe
    }, [gameId, playId, result])
    const game = result?.data?.game
    const state = result?.data?.game?.state
    const players = mapHostPlayers(result?.data?.game)
    return {
        ...result,
        game: game as Game,
        player: find(players, (p) => p.id === playerId) as HostPlayer,
        players: players as HostPlayer[],
        state: state as GameState,
    }
}

const GamePlayerQuery = gql`
    query gamePlayer($playerId: String!, $gameId: String!) {
        gamePlayer(playerId: $playerId, gameId: $gameId) {
            id
            isHost
            player {
                id
                nickname
            }
            game {
                id
                type
                status
            }
        }
    }
`

type GamePlayer = QueryResult & {
    playId?: string
}

export const usePlayId = (gameId: string, playerId: string): GamePlayer => {
    const result = useQuery(GamePlayerQuery, {
        variables: { gameId, playerId },
        skip: !gameId || !playerId,
        fetchPolicy: 'no-cache',
    })
    const playId = result?.data?.gamePlayer?.id as string
    return { ...result, playId }
}

const StartGameMutation = gql`
    mutation startGame($playId: ID!) {
        setGameStatus(playId: $playId, status: InProgress) {
            timestamp
            ... on GameStatusEvent {
                changedFrom
                changedTo
            }
        }
    }
`

export const useStartGame = (
    playId?: string
): [() => Promise<ExecutionResult>, MutationResult] => {
    const [startMutation, results] = useMutation(StartGameMutation)
    return [() => startMutation({ variables: { playId } }), results]
}

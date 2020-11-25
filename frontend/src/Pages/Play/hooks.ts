import { ApolloError, gql } from 'apollo-boost'
import { useEffect, useRef } from 'react'
import {
    ExecutionResult,
    MutationResult,
    QueryResult,
} from '@apollo/react-common'
import { useMutation } from '@apollo/react-hooks'

import { Game, GameState } from 'types/Game'
import { Player } from 'types/Player'
import {
    AlliesAndEnemiesGameStateFragment,
    AlliesAndEnemiesGameEventFragment,
} from 'Games/AlliesAndEnemies'
import { usePollingQuery } from '../../hooks/apollo'

const PlayerFragment = gql`
    fragment PlayerFragement on Player {
        id
        nickname
        host
    }
`

const GameFragment = gql`
    fragment GameFragment on Game {
        id
        type
        status
        players {
            ...PlayerFragement
        }
    }
    ${PlayerFragment}
`

const GameEventFragment = gql`
    fragment GameEventFragment on GameEvent {
        source {
            ...PlayerFragement
        }
        timestamp
        ... on GameStatusEvent {
            status {
                current
                last
            }
        }
        ... on JoinGameEvent {
            joined {
                ...PlayerFragement
            }
        }
        ...AlliesAndEnemiesGameEventFragment
        __typename
    }
    ${AlliesAndEnemiesGameEventFragment}
    ${PlayerFragment}
`

const GameStateFragment = gql`
    fragment GameStateFragment on GameState {
        ...AlliesAndEnemiesGameStateFragment
    }
    ${AlliesAndEnemiesGameStateFragment}
`

const GameQuery = gql`
    query playQuery($gameId: ID!, $playerId: ID!) {
        game(id: $gameId) {
            ...GameFragment
            player(playerId: $playerId) {
                ...PlayerFragement
            }
            state(playerId: $playerId) {
                ...GameStateFragment
            }
        }
    }
    ${GameFragment}
    ${GameStateFragment}
    ${PlayerFragment}
`

const GameSubscription = gql`
    subscription playSubscription($gameId: ID!, $playerId: ID!) {
        play(gameId: $gameId) {
            game {
                ...GameFragment
                player(playerId: $playerId) {
                    ...PlayerFragement
                }
                state(playerId: $playerId) {
                    ...GameStateFragment
                }
            }
            ...GameEventFragment
        }
    }
    ${GameFragment}
    ${GameEventFragment}
    ${GameStateFragment}
    ${PlayerFragment}
`

type PlayGame = QueryResult & {
    game?: Game
    players?: Player[]
    player?: Player
    state?: GameState
}

export const usePlayGame = (gameId: string, playerId: string): PlayGame => {
    const events = useRef<any[]>([])
    const result = usePollingQuery(GameQuery, {
        variables: { gameId, playerId },
        skip: !gameId || !playerId,
    })
    const errorRef = useRef(result.error)
    useEffect(() => {
        return result?.subscribeToMore({
            document: GameSubscription,
            variables: { gameId, playerId },
            updateQuery: (prev, { subscriptionData }) => {
                if (subscriptionData?.data) {
                    const { game, ...event } = subscriptionData.data.play
                    events.current.push(event)
                    return { game }
                }
            },
            onError: (e) => {
                errorRef.current = e as ApolloError
            },
        })
    }, [gameId, playerId, result])
    return {
        ...result,
        error: errorRef.current,
        game: result?.data?.game as Game,
        player: result?.data?.game?.player as Player,
        players: result?.data?.game?.players as Player[],
        state: result?.data?.game?.state as GameState,
    }
}

const StartGameMutation = gql`
    mutation startGame($playerId: ID!, $gameId: ID!) {
        setGameStatus(
            gameId: $gameId
            playerId: $playerId
            status: InProgress
        ) {
            timestamp
        }
    }
`

export const useStartGame = (): [
    (gameId: string, playerId: string) => Promise<ExecutionResult>,
    MutationResult
] => {
    const [startMutation, results] = useMutation(StartGameMutation)
    return [
        (gameId: string, playerId: string) =>
            startMutation({ variables: { gameId, playerId } }),
        results,
    ]
}

import { gql } from 'apollo-boost'
import { useEffect } from 'react'
import {
    ExecutionResult,
    MutationResult,
    QueryResult,
} from '@apollo/react-common'
import { useQuery, useMutation } from '@apollo/react-hooks'
import find from 'lodash/find'

import { Game, GameState } from 'types/Game'
import { Player } from 'types/Player'
import { AlliesAndEnemiesGameStateFragment } from 'Games/AlliesAndEnemies'

const GameFragment = gql`
    fragment GameFragment on Game {
        id
        type
        status
        players {
            id
            nickname
            host
        }
    }
`

const GameQuery = gql`
    query playQuery($gameId: ID!, $playerId: ID!) {
        game(id: $gameId) {
            ...GameFragment
            state(playerId: $playerId) {
                ...AlliesAndEnemiesGameStateFragment
            }
        }
    }
    ${GameFragment}
    ${AlliesAndEnemiesGameStateFragment}
`

const GameSubscription = gql`
    subscription playSubscription($gameId: ID!, $playerId: ID!) {
        play(gameId: $gameId) {
            game {
                ...GameFragment
                state(playerId: $playerId) {
                    ...AlliesAndEnemiesGameStateFragment
                }
            }
            timestamp
            __typename
        }
    }
    ${GameFragment}
    ${AlliesAndEnemiesGameStateFragment}
`

type PlayGame = QueryResult & {
    game?: Game
    players?: Player[]
    player?: Player
    state?: GameState
}

export const usePlayGame = (gameId: string, playerId: string): PlayGame => {
    const result = useQuery(GameQuery, {
        variables: { gameId, playerId },
        skip: !gameId || !playerId,
    })
    useEffect(() => {
        let unsubscribe: (() => void) | undefined
        if (gameId && playerId) {
            unsubscribe = result?.subscribeToMore({
                document: GameSubscription,
                variables: { gameId, playerId },
                updateQuery: (prev, { subscriptionData }) => {
                    console.log('subscriptionData:', subscriptionData?.data)
                    const { game, state } = subscriptionData?.data?.play
                    return { game, state }
                },
            })
        }
        if (unsubscribe) return unsubscribe
    }, [gameId, playerId, result])
    const game = result?.data?.game
    const state = result?.data?.game?.state
    const players = result?.data?.game?.players
    return {
        ...result,
        game: game as Game,
        player: find(players, (p) => p.id === playerId),
        players: players as Player[],
        state: { game, ...state } as GameState,
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

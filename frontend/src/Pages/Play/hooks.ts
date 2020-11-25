import { ApolloError, gql } from 'apollo-boost'
import { useEffect, useRef } from 'react'
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
    const errorRef = useRef(result.error)
    useEffect(() => {
        return result?.subscribeToMore({
            document: GameSubscription,
            variables: { gameId, playerId },
            updateQuery: (prev, { subscriptionData }) => {
                if (subscriptionData?.data) {
                    return { ...prev, ...subscriptionData.data.play }
                }
            },
            onError: (e) => {
                errorRef.current = e as ApolloError
            },
        })
    }, [gameId, playerId, result])
    return {
        ...result,
        game: result?.data?.game as Game,
        players: result?.data?.game?.players as Player[],
        state: result?.data?.game?.state as GameState,
        error: errorRef.current,
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

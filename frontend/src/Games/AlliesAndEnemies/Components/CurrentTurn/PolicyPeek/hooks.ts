import { gql } from 'apollo-boost'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { MutationResult, QueryResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

import { Card } from 'Games/AlliesAndEnemies/types'

const PolicyPeekQuery = gql`
    query peek($gameId: ID!, $playerId: ID!) {
        cards: alliesAndEnemiesPolicyPeek(
            gameId: $gameId
            playerId: $playerId
        ) {
            suit
        }
    }
`

export const usePolicyPeek = (
    gameId: string,
    playerId: string
): QueryResult & { cards?: [Card, Card, Card] } => {
    const results = useQuery(PolicyPeekQuery, {
        variables: { gameId, playerId },
    })
    return {
        ...results,
        cards: results.data?.cards,
    }
}

const PolicyPeekOkMutation = gql`
    mutation peek($gameId: ID!, $playerId: ID!) {
        alliesAndEnemiesPolicyPeekOk(playerId: $playerId, gameId: $gameId) {
            timestamp
        }
    }
`
export const usePolicyPeekOk = (
    gameId: string,
    playerId: string
): [() => Promise<ExecutionResult>, MutationResult] =>
    useMutation(PolicyPeekOkMutation, {
        variables: { gameId, playerId },
    })

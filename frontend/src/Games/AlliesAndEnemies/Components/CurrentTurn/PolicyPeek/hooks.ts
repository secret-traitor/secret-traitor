import { gql } from 'apollo-boost'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { MutationResult, QueryResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

import { Card } from 'Games/AlliesAndEnemies/types'

const PolicyPeekQuery = gql`
    query peek($playId: ID!) {
        cards: alliesAndEnemiesPolicyPeek(playId: $playId) {
            suit
        }
    }
`

export const usePolicyPeek = (
    playId: string
): QueryResult & { cards?: [Card, Card, Card] } => {
    const results = useQuery(PolicyPeekQuery, { variables: { playId } })
    return {
        ...results,
        cards: results.data?.cards,
    }
}

const PolicyPeekOkMutation = gql`
    mutation peek($playId: ID!) {
        alliesAndEnemiesPolicyPeekOk(playId: $playId) {
            timestamp
        }
    }
`
export const usePolicyPeekOk = (
    playId: string
): [() => Promise<ExecutionResult>, MutationResult] =>
    useMutation(PolicyPeekOkMutation, {
        variables: { playId },
    })

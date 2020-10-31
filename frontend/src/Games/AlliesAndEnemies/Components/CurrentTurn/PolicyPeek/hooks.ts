import { gql } from 'apollo-boost'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { MutationResult, QueryResult } from '@apollo/client/react/types/types'
import { FetchResult } from '@apollo/client/link/core'

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
): [() => Promise<FetchResult>, MutationResult] =>
    useMutation(PolicyPeekOkMutation, {
        variables: { playId },
    })

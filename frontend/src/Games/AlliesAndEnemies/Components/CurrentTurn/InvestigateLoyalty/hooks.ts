import { gql } from 'apollo-boost'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import { MutationResult, QueryResult } from '@apollo/client/react/types/types'
import { FetchResult } from '@apollo/client/link/core'

import { PlayerState } from 'Games/AlliesAndEnemies/types'

const InvestigateLoyaltyQuery = gql`
    query investigateLoyalty($playId: ID!, $playerId: ID!) {
        player: alliesAndEnemiesInvestigateLoyalty(
            playId: $playId
            playerId: $playerId
        ) {
            id
            nickname
            position
            role
        }
    }
`

export const useInvestigateLoyalty = (
    playId: string
): [(player: PlayerState) => void, QueryResult & { player?: PlayerState }] => {
    const [investigateLoyaltyQuery, results] = useLazyQuery(
        InvestigateLoyaltyQuery
    )
    let player = results?.data?.player
    if (player) {
        localStorage.setItem(playId + 'player', JSON.stringify(player))
    }
    if (!player) {
        const stored = localStorage.getItem(playId + 'player')
        if (stored) {
            player = JSON.parse(stored)
        }
    }
    return [
        async (player) => {
            await investigateLoyaltyQuery({
                variables: { playId, playerId: player.id },
            })
        },
        {
            ...(results as QueryResult),
            player,
        },
    ]
}

const InvestigateLoyaltyOkMutation = gql`
    mutation investigateLoyalty($playId: ID!) {
        alliesAndEnemiesInvestigateLoyaltyOk(playId: $playId) {
            timestamp
        }
    }
`
export const useInvestigateLoyaltyOk = (
    playId: string
): [() => Promise<FetchResult>, MutationResult] =>
    useMutation(InvestigateLoyaltyOkMutation, {
        variables: { playId },
    })

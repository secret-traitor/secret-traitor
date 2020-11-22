import { gql } from 'apollo-boost'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import { MutationResult, QueryResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

import { PlayerState } from 'Games/AlliesAndEnemies/types'

const InvestigateLoyaltyQuery = gql`
    query investigateLoyalty(
        $gameId: ID!
        $playerId: ID!
        $investigatePlayerId: ID!
    ) {
        player: alliesAndEnemiesInvestigateLoyalty(
            gameId: $gameId
            playerId: $playerId
            investigatePlayerId: $investigatePlayerId
        ) {
            host
            id
            nickname
            position
            role
            status
            __typename
        }
    }
`

export const useInvestigateLoyalty = (
    gameId: string,
    playerId: string
): [(player: PlayerState) => void, QueryResult & { player?: PlayerState }] => {
    const key = `AlliesAndEnemies::${gameId}::InvestigateLoyalty`
    const [investigateLoyaltyQuery, results] = useLazyQuery(
        InvestigateLoyaltyQuery
    )
    let investigatedPlayer = results?.data?.player
    if (investigatedPlayer) {
        localStorage.setItem(key, JSON.stringify(investigatedPlayer))
    }
    if (!investigatedPlayer) {
        const stored = localStorage.getItem(key)
        if (stored) {
            investigatedPlayer = JSON.parse(stored)
        }
    }
    const investigateLoyalty = async (player: PlayerState) => {
        await investigateLoyaltyQuery({
            variables: { gameId, playerId, investigatePlayerId: player.id },
        })
    }
    return [
        investigateLoyalty,
        {
            ...(results as QueryResult),
            player: investigatedPlayer,
        },
    ]
}

const InvestigateLoyaltyOkMutation = gql`
    mutation investigateLoyalty($gameId: ID!, $playerId: ID!) {
        alliesAndEnemiesInvestigateLoyaltyOk(
            playerId: $playerId
            gameId: $gameId
        ) {
            timestamp
        }
    }
`
export const useInvestigateLoyaltyOk = (
    gameId: string,
    playerId: string
): [() => Promise<ExecutionResult>, MutationResult] => {
    const [okFn, results] = useMutation(InvestigateLoyaltyOkMutation, {
        variables: { gameId, playerId },
    })
    return [() => okFn(), results]
}

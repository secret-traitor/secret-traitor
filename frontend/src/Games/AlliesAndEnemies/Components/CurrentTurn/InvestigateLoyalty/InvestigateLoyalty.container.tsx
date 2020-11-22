import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

import {
    InvestigateLoyaltyPick,
    InvestigateLoyaltyView,
} from './InvestigateLoyalty.component'
import { useInvestigateLoyaltyOk, useInvestigateLoyalty } from './hooks'

const InvestigateLoyaltyContainer: React.FC<AlliesAndEnemiesState> = ({
    players,
    game,
    viewingPlayer,
}) => {
    const [investigateLoyalty, result] = useInvestigateLoyalty(
        game.id,
        viewingPlayer.id
    )
    const { player, error, loading } = result
    const [ok] = useInvestigateLoyaltyOk(game.id, viewingPlayer.id)
    if (error) {
        return <>{error.message}</>
    }
    return (
        <>
            {loading && <LoadingScreen />}
            {!player && (
                <InvestigateLoyaltyPick
                    players={players}
                    pick={investigateLoyalty}
                    viewingPlayer={viewingPlayer}
                />
            )}
            {player && <InvestigateLoyaltyView ok={ok} player={player} />}
        </>
    )
}

export default InvestigateLoyaltyContainer

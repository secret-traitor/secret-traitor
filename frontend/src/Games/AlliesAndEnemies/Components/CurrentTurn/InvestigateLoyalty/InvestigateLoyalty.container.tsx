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
    playId,
    viewingPlayer,
}) => {
    const [investigateLoyalty, result] = useInvestigateLoyalty(playId)
    const { player, error, loading } = result
    const [ok] = useInvestigateLoyaltyOk(playId)
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

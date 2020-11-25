import React from 'react'

import LoadingScreen from 'Components/LoadingScreen'
import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import PolicyPeak from './PolicyPeek.component'
import { usePolicyPeekOk, usePolicyPeek } from './hooks'

const PolicyPeekContainer: React.FC<AlliesAndEnemiesState> = ({
    gameId,
    viewingPlayer,
}) => {
    const { cards, loading, error } = usePolicyPeek(gameId, viewingPlayer.id)
    const [ok] = usePolicyPeekOk(gameId, viewingPlayer.id)
    if (error) {
        return <>{error.message}</>
    }
    if (!cards && !loading) {
        return <>Uh Oh!</>
    }
    return (
        <>
            {loading && <LoadingScreen />}
            {cards && <PolicyPeak cards={cards} ok={ok} />}
        </>
    )
}

export default PolicyPeekContainer

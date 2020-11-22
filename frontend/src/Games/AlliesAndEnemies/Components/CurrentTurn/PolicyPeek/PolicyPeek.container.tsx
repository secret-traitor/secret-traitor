import React from 'react'

import LoadingScreen from 'Components/LoadingScreen'
import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import PolicyPeak from './PolicyPeek.component'
import { usePolicyPeekOk, usePolicyPeek } from './hooks'

const PolicyPeekContainer: React.FC<AlliesAndEnemiesState> = ({
    game,
    viewingPlayer,
}) => {
    const { cards, loading, error } = usePolicyPeek(game.id, viewingPlayer.id)
    const [ok] = usePolicyPeekOk(game.id, viewingPlayer.id)
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

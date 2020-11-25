import React from 'react'

import LoadingScreen from 'Components/LoadingScreen'
import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import PolicyPeak from './PolicyPeek.component'
import { usePolicyPeekOk, usePolicyPeek } from './hooks'

const PolicyPeekContainer: React.FC<AlliesAndEnemiesState> = ({
    gameId,
    viewingPlayer,
}) => {
    const { cards, loading: peekLoading, error } = usePolicyPeek(
        gameId,
        viewingPlayer.id
    )
    const [ok, { loading: okLoading }] = usePolicyPeekOk(
        gameId,
        viewingPlayer.id
    )
    if (error) {
        return <>{error.message}</>
    }
    if (!cards && !peekLoading) {
        return <>Uh Oh!</>
    }
    return (
        <>
            {(peekLoading || okLoading) && <LoadingScreen />}
            {cards && <PolicyPeak cards={cards} ok={ok} />}
        </>
    )
}

export default PolicyPeekContainer

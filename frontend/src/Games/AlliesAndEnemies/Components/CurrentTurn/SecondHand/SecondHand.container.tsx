import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

import SecondHandComponent from './SecondHand.component'
import { useSecondHandDiscard, useCallVeto } from './hooks'

const SecondHand: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    gameId,
    viewingPlayer,
}) => {
    const [discard, { loading: discardLoading }] = useSecondHandDiscard(
        gameId,
        viewingPlayer.id
    )
    const [callVeto, { loading: callVetoLoading }] = useCallVeto(
        gameId,
        viewingPlayer.id
    )
    if (!currentTurn.secondHand) {
        return <>Uh Oh</> // TODO: Handle SecondHand error case
    }
    return (
        <>
            {(discardLoading || callVetoLoading) && <LoadingScreen />}
            <SecondHandComponent
                cards={currentTurn.secondHand}
                discard={discard}
                enableVeto={currentTurn.enableVeto}
                callVeto={callVeto}
            />
        </>
    )
}

export default SecondHand

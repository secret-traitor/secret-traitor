import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import SecondHandComponent from './SecondHand.component'
import { useSecondHandDiscard, useCallVeto } from './hooks'

const SecondHand: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    gameId,
    viewingPlayer,
}) => {
    const [discard] = useSecondHandDiscard(gameId, viewingPlayer.id)
    const [callVeto] = useCallVeto(gameId, viewingPlayer.id)
    if (!currentTurn.secondHand) {
        return <>Uh Oh</> // TODO: Handle SecondHand error case
    }
    return (
        <SecondHandComponent
            cards={currentTurn.secondHand}
            discard={discard}
            enableVeto={currentTurn.enableVeto}
            callVeto={callVeto}
        />
    )
}

export default SecondHand

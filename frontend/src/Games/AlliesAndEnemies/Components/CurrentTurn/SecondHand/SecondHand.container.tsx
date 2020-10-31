import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import SecondHandComponent from './SecondHand.component'
import { useSecondHandDiscard, useCallVeto } from './hooks'

const SecondHand: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    playId,
}) => {
    const [discard] = useSecondHandDiscard(playId)
    const [callVeto] = useCallVeto(playId)
    if (!currentTurn.secondHand) {
        return <>Uh Oh</>
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

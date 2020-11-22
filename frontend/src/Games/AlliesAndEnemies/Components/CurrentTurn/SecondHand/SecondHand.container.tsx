import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import SecondHandComponent from './SecondHand.component'
import { useSecondHandDiscard, useCallVeto } from './hooks'

const SecondHand: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    game,
    viewingPlayer,
}) => {
    const [discard] = useSecondHandDiscard(game.id, viewingPlayer.id)
    const [callVeto] = useCallVeto(game.id, viewingPlayer.id)
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

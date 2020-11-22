import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import FirstHandComponent from './FirstHand.component'
import { useFirstHandDiscard } from './hooks'

const FirstHand: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    viewingPlayer,
    game,
}) => {
    const [discard] = useFirstHandDiscard(game.id, viewingPlayer.id)
    if (!currentTurn.firstHand) {
        return <>Uh Oh</>
    }
    return (
        <FirstHandComponent cards={currentTurn.firstHand} discard={discard} />
    )
}

export default FirstHand

import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import FirstHandComponent from './FirstHand.component'
import { useFirstHandDiscard } from './hooks'

const FirstHand: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    playId,
}) => {
    const [discard] = useFirstHandDiscard(playId)
    if (!currentTurn.firstHand) {
        return <>Uh Oh</>
    }
    return (
        <FirstHandComponent cards={currentTurn.firstHand} discard={discard} />
    )
}

export default FirstHand

import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

import FirstHandComponent from './FirstHand.component'
import { useFirstHandDiscard } from './hooks'

const FirstHand: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    viewingPlayer,
    gameId,
}) => {
    const [discard, { loading }] = useFirstHandDiscard(gameId, viewingPlayer.id)
    if (!currentTurn.firstHand) {
        return <>Uh Oh</>
    }
    return (
        <>
            {loading && <LoadingScreen />}
            <FirstHandComponent
                cards={currentTurn.firstHand}
                discard={discard}
            />
        </>
    )
}

export default FirstHand

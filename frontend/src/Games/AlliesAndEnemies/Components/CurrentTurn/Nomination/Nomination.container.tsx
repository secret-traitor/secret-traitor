import React from 'react'
import map from 'lodash/map'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

import NominationComponent from './Nomination.component'
import { useNominate } from './hooks'

const Nomination: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    gameId,
    players,
    viewingPlayer,
}) => {
    const [nominate, result] = useNominate(gameId, viewingPlayer.id)
    const disabledForPositions = map(
        currentTurn.ineligibleNominations,
        'position'
    )
    return (
        <>
            {result.loading && <LoadingScreen />}
            <NominationComponent
                viewingPlayer={viewingPlayer}
                players={players}
                nominate={nominate}
                disabledForPositions={disabledForPositions}
            />
        </>
    )
}

export default Nomination

import React from 'react'
import map from 'lodash/map'

import {
    AlliesAndEnemiesState,
    PlayerState,
} from 'Games/AlliesAndEnemies/types'
import NominationComponent from './Nomination.component'
import { useNominate } from './hooks'
import LoadingScreen from '../../../../../Components/LoadingScreen'

const Nomination: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    players,
    viewingPlayer,
    playId,
}) => {
    const [nominate, result] = useNominate(playId)
    const disabledForPositions = map(
        currentTurn.disabledNominations,
        'position'
    )
    return (
        <>
            {result.loading && <LoadingScreen />}
            <NominationComponent
                viewingPlayer={viewingPlayer}
                currentPosition={currentTurn.position}
                players={players}
                nominate={nominate}
                disabledForPositions={disabledForPositions}
            />
        </>
    )
}

export default Nomination

import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

import SpecialElection from './SpecialElection.component'
import { useNominateSpecialElection } from './hooks'

const SpecialElectionContainer: React.FC<AlliesAndEnemiesState> = ({
    gameId,
    players,
    viewingPlayer,
}) => {
    const [nominate, { loading }] = useNominateSpecialElection(
        gameId,
        viewingPlayer.id
    )
    return (
        <>
            {loading && <LoadingScreen />}
            <SpecialElection
                players={players}
                viewingPlayer={viewingPlayer}
                nominate={nominate}
            />
        </>
    )
}

export default SpecialElectionContainer

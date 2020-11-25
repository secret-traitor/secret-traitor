import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import SpecialElection from './SpecialElection.component'
import { useNominateSpecialElection } from './hooks'

const SpecialElectionContainer: React.FC<AlliesAndEnemiesState> = ({
    gameId,
    players,
    viewingPlayer,
}) => {
    const [nominate] = useNominateSpecialElection(gameId, viewingPlayer.id)
    return (
        <SpecialElection
            players={players}
            viewingPlayer={viewingPlayer}
            nominate={nominate}
        />
    )
}

export default SpecialElectionContainer

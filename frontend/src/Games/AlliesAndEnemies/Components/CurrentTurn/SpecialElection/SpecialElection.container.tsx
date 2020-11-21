import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import SpecialElection from './SpecialElection.component'
import { useNominateSpecialElection } from './hooks'

const SpecialElectionContainer: React.FC<AlliesAndEnemiesState> = ({
    game,
    players,
    viewingPlayer,
}) => {
    const [nominate] = useNominateSpecialElection(game.id, viewingPlayer.id)
    return (
        <SpecialElection
            players={players}
            viewingPlayer={viewingPlayer}
            nominate={nominate}
        />
    )
}

export default SpecialElectionContainer

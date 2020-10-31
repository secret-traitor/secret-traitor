import React from 'react'
import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import ElectionComponent from './Election.component'
import { useVote } from './hooks'

const Election: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    viewingPlayer,
    playId,
}) => {
    const [vote, results] = useVote(playId)
    if (!currentTurn.nominatedPlayer) {
        // TODO: handle no nominated player
        return <>Uh Oh</>
    }
    return (
        <ElectionComponent
            governorNominee={currentTurn.nominatedPlayer}
            presidentNominee={currentTurn.waitingOn}
            vote={vote}
            viewingPlayer={viewingPlayer}
        />
    )
}

export default Election

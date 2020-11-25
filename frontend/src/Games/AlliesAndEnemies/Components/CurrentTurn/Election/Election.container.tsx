import React from 'react'
import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import ElectionComponent from './Election.component'
import { useVote } from './hooks'

const Election: React.FC<AlliesAndEnemiesState> = ({
    currentTurn,
    gameId,
    viewingPlayer,
}) => {
    const [vote] = useVote(gameId, viewingPlayer.id)
    if (!currentTurn.nominatedPlayer) {
        return <>Uh Oh</> // TODO: handle no nominated player
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

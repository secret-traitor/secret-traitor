import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

import VoteVeto from './VoteVeto.component'
import { useVoteVeto } from './hooks'

const VoteVetoContainer: React.FC<AlliesAndEnemiesState> = ({
    gameId,
    viewingPlayer,
    currentTurn,
}) => {
    const [vote, { loading }] = useVoteVeto(gameId, viewingPlayer.id)
    return (
        <>
            {loading && <LoadingScreen />}
            <VoteVeto vote={vote} governor={currentTurn.nominatedPlayer} />
        </>
    )
}

export default VoteVetoContainer

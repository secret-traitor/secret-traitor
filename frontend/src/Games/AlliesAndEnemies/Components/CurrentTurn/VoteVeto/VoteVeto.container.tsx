import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import VoteVeto from './VoteVeto.component'
import { useVoteVeto } from './hooks'

const VoteVetoContainer: React.FC<AlliesAndEnemiesState> = ({
    game,
    viewingPlayer,
    currentTurn,
}) => {
    const [vote] = useVoteVeto(game.id, viewingPlayer.id)
    return <VoteVeto vote={vote} governor={currentTurn.nominatedPlayer} />
}

export default VoteVetoContainer

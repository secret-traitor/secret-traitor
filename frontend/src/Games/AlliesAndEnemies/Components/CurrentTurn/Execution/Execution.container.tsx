import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import Execution from './Execution.component'
import { useExecutePlayer } from './hooks'

const ExecutionContainer: React.FC<AlliesAndEnemiesState> = ({
    gameId,
    players,
    viewingPlayer,
}) => {
    const [execute] = useExecutePlayer(gameId, viewingPlayer.id)
    return (
        <Execution
            viewingPlayer={viewingPlayer}
            players={players}
            execute={execute}
        />
    )
}

export default ExecutionContainer

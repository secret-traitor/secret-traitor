import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import Execution from './Execution.component'
import { useExecutePlayer } from './hooks'

const ExecutionContainer: React.FC<AlliesAndEnemiesState> = ({
    playId,
    players,
    viewingPlayer,
}) => {
    const [execute] = useExecutePlayer(playId)
    return (
        <Execution
            viewingPlayer={viewingPlayer}
            players={players}
            execute={execute}
        />
    )
}

export default ExecutionContainer

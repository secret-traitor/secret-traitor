import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'

import Execution from './Execution.component'
import { useExecutePlayer } from './hooks'

const ExecutionContainer: React.FC<AlliesAndEnemiesState> = ({
    game,
    players,
    viewingPlayer,
}) => {
    const [execute] = useExecutePlayer(game.id, viewingPlayer.id)
    return (
        <Execution
            viewingPlayer={viewingPlayer}
            players={players}
            execute={execute}
        />
    )
}

export default ExecutionContainer

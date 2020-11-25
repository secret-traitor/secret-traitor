import React from 'react'

import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

import Execution from './Execution.component'
import { useExecutePlayer } from './hooks'

const ExecutionContainer: React.FC<AlliesAndEnemiesState> = ({
    gameId,
    players,
    viewingPlayer,
}) => {
    const [execute, { loading }] = useExecutePlayer(gameId, viewingPlayer.id)
    return (
        <>
            {loading && <LoadingScreen />}
            <Execution
                viewingPlayer={viewingPlayer}
                players={players}
                execute={execute}
            />
        </>
    )
}

export default ExecutionContainer

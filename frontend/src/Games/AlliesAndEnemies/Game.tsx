import React from 'react'
import { Box, Main } from 'grommet'

import { AlliesAndEnemiesState } from './types'
import { CurrentTurn } from './Components/CurrentTurn'
import { PlayerBoard } from './Components/PlayerBoard'
import { PolicyBoard } from './Components/PolicyBoard'

const Game: React.FC<AlliesAndEnemiesState> = (props) => {
    return (
        <Main fill flex align="center" justify="center">
            <Box
                align="center"
                gap="small"
                justify="center"
                pad="medium"
                width="large"
            >
                <CurrentTurn {...props} />
                <PlayerBoard {...props} />
                <PolicyBoard {...props} />
            </Box>
        </Main>
    )
}

export default Game

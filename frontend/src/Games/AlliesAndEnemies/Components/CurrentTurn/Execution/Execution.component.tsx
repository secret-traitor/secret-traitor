import { Box, Text } from 'grommet'
import React from 'react'

import Popup from 'Components/Popup'

import { PlayerState } from 'Games/AlliesAndEnemies/types'
import { PlayerCards } from 'Games/AlliesAndEnemies/Components/Cards/PlayerCards'

type ExecutionProps = {
    players: PlayerState[]
    viewingPlayer: PlayerState
    execute: (player: PlayerState) => void
}

const Execution: React.FC<ExecutionProps> = ({
    viewingPlayer,
    players,
    execute,
}) => (
    <Popup>
        <Box dir="row" gap="small" align="center">
            <Text textAlign="center" size="large" weight="bold">
                It is your turn...
            </Text>
            <Text textAlign="center" weight="bold" color="red">
                Execution
            </Text>
            <Text textAlign="center">
                You need to select someone to from the list below. They will be
                executed. Think carefully, this player will no longer be able to
                play this game.
            </Text>
            <PlayerCards
                players={players}
                viewingPlayer={viewingPlayer}
                selectable={{
                    disabledForPositions: [viewingPlayer.position],
                    onSubmit: execute,
                    label: 'Select Player',
                }}
            />
            <Text textAlign="center" size="large" weight="bold">
                You may discuss your choice.
            </Text>
        </Box>
    </Popup>
)

export default Execution

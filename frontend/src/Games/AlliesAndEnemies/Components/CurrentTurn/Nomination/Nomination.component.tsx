import { Box, Text } from 'grommet'
import React from 'react'

import Popup from 'Components/Popup'

import { PlayerState } from 'Games/AlliesAndEnemies/types'
import { PlayerCards } from 'Games/AlliesAndEnemies/Components/Cards/PlayerCards'

type NominationProps = {
    players: PlayerState[]
    viewingPlayer: PlayerState
    disabledForPositions: number[]
    nominate: (player: PlayerState) => void
}

const Nomination: React.FC<NominationProps> = ({
    disabledForPositions,
    viewingPlayer,
    players,
    nominate,
}) => (
    <Popup>
        <Box dir="row" gap="small" align="center">
            <Text textAlign="center" size="large" weight="bold">
                It is your turn...
            </Text>
            <Text textAlign="center">
                You need to select someone to nominate from the list below.
            </Text>
            <PlayerCards
                players={players}
                viewingPlayer={viewingPlayer}
                selectable={{
                    disabledForPositions: disabledForPositions,
                    onSubmit: nominate,
                    label: 'Nominate Player',
                }}
            />
            <Text textAlign="center" size="large" weight="bold">
                You may discuss your choice.
            </Text>
        </Box>
    </Popup>
)

export default Nomination

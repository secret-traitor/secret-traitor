import { Box, Text } from 'grommet'
import React from 'react'

import Popup from 'Components/Popup'

import { PlayerState } from 'Games/AlliesAndEnemies/types'
import { PlayerCards } from 'Games/AlliesAndEnemies/Components/Cards/PlayerCards'

type SpecialElectionProps = {
    players: PlayerState[]
    viewingPlayer: PlayerState
    nominate: (player: PlayerState) => void
}

const SpecialElection: React.FC<SpecialElectionProps> = ({
    viewingPlayer,
    players,
    nominate,
}) => (
    <Popup>
        <Box dir="row" gap="small" align="center">
            <Text textAlign="center" size="large" weight="bold">
                It is your turn...
            </Text>
            <Text textAlign="center" weight="bold" color="brand-3">
                Special Election
            </Text>
            <Text textAlign="center">
                You need to select someone to from the list below. They will be
                the next President.
            </Text>
            <PlayerCards
                players={players}
                viewingPlayer={viewingPlayer}
                selectable={{
                    disabledForPositions: [viewingPlayer.position],
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

export default SpecialElection

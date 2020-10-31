import React from 'react'
import { Box, Button, Text } from 'grommet'

import { PlayerState } from 'Games/AlliesAndEnemies/types'
import Popup from 'Components/Popup'
import {
    PlayerCard,
    PlayerCards,
} from 'Games/AlliesAndEnemies/Components/Cards'

export type InvestigateLoyaltyPickProps = {
    players: PlayerState[]
    pick: (player: PlayerState) => void
    viewingPlayer: PlayerState
}

export const InvestigateLoyaltyPick: React.FC<InvestigateLoyaltyPickProps> = ({
    pick,
    players,
    viewingPlayer,
}) => {
    return (
        <Popup>
            <Box dir="row" gap="small" align="center">
                <Text textAlign="center" size="large" weight="bold">
                    It is your turn...
                </Text>
                <Text textAlign="center" weight="bold" color="brand-3">
                    Investigate Loyalty
                </Text>
                <Text textAlign="center">
                    You need to select someone to from the list below. You will
                    be shown which team they are on.
                </Text>
                <PlayerCards
                    players={players}
                    viewingPlayer={viewingPlayer}
                    selectable={{
                        disabledForPositions: [viewingPlayer.position],
                        onSubmit: pick,
                        label: 'Select Player',
                    }}
                />
                <Text textAlign="center" size="large" weight="bold">
                    You may discuss your choice.
                </Text>
            </Box>
        </Popup>
    )
}

type InvestigateLoyaltyViewProps = {
    ok: () => void
    player: PlayerState
}

export const InvestigateLoyaltyView: React.FC<InvestigateLoyaltyViewProps> = ({
    ok,
    player,
}) => (
    <Popup onClose={() => ok()}>
        <Box dir="row" gap="medium" align="center" width="medium">
            <Text textAlign="center">
                Below is the loyalty of the player you have chosen.
            </Text>
            <PlayerCard {...player} />
            <Button primary color="brand-3" label="Ok" onClick={() => ok()} />
        </Box>
    </Popup>
)

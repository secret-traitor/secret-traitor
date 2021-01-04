import React from 'react'
import { Box, Button, Text } from 'grommet'

import { PlayerVote } from 'Games/AlliesAndEnemies/types'
import Popup from 'Components/Popup'
import { Player } from 'Types/Player'

type VoteVetoProps = {
    vote: (vote: PlayerVote) => void
    governor?: Player
}

const VoteVetoContainer: React.FC<VoteVetoProps> = ({ vote, governor }) => {
    return (
        <Popup>
            <Box dir="row" gap="medium" align="center" width="medium">
                <Text textAlign="center" size="large" weight="bold">
                    It is your turn...
                </Text>
                <Text textAlign="center" weight="bold" color="brand-3">
                    Veto
                </Text>
                <Text textAlign="center">
                    {governor?.nickname || 'The Governor'} has requested a veto,
                    do you accept?
                </Text>
                <Box direction="row" gap="medium">
                    <Button
                        primary
                        color="brand-2"
                        size="large"
                        label="Nay!"
                        onClick={() => vote('No')}
                    />
                    <Button
                        primary
                        color="brand-3"
                        size="large"
                        label="Yay!"
                        onClick={() => vote('Yes')}
                    />
                </Box>
                <Text textAlign="center" size="large" weight="bold">
                    You may discuss.
                </Text>
            </Box>
        </Popup>
    )
}

export default VoteVetoContainer

import React from 'react'
import { Box, Text } from 'grommet'

import { TeamState } from './types'
import { PlayerCard } from './PlayerCard'

export const TeamDetails: React.FC<
    TeamState & {
        playerNickname: string
    }
> = ({ teammates, playerRole, playerNickname }) => (
    <Box gap="medium" align="center" direction="column">
        <Text>You are:</Text>
        <PlayerCard role={playerRole} nickname={playerNickname} />
        {teammates ? (
            <Box gap="medium" align="center">
                <Text>Your teammates are:</Text>
                <Box direction="column" gap="medium">
                    {teammates.map((player) => (
                        <PlayerCard
                            key={player.id}
                            role={player.role}
                            nickname={player.nickname}
                        />
                    ))}
                </Box>
                <Text>Shhh! Dont tell anyone!</Text>
            </Box>
        ) : (
            <Box>You do not know who your teammates are.</Box>
        )}
    </Box>
)

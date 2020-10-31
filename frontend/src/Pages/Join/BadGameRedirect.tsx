import React from 'react'
import { Box, Text } from 'grommet'

import { getHomeUrl } from 'links'
import { LobbyCodeText } from 'Components/GameText'
import ConfirmRedirect from 'Components/ConfirmRedirect'

export const BadGameRedirect: React.FC<{ gameId: string }> = ({ gameId }) => (
    <ConfirmRedirect to={getHomeUrl()} delay={30000}>
        <Box align="center" gap="medium">
            <Text size="large" weight="bold" textAlign="center">
                Uh Oh!
            </Text>
            <Text textAlign="center">
                We can not find a game with lobby code "
                <LobbyCodeText gameId={gameId} />
                "!
            </Text>
        </Box>
    </ConfirmRedirect>
)

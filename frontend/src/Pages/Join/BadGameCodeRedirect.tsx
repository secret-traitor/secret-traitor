import React from 'react'
import { Box, Text } from 'grommet'

import { getHomeUrl } from 'links'
import { LobbyCodeText } from 'Components/GameText'
import ConfirmRedirect from 'Components/ConfirmRedirect'

export const BadGameCodeRedirect: React.FC<{ gameCode: string }> = ({
    gameCode,
}) => (
    <ConfirmRedirect to={getHomeUrl()} delay={30000}>
        <Box align="center" gap="medium">
            <Text size="large" weight="bold" textAlign="center">
                Uh Oh!
            </Text>
            <Text textAlign="center">
                We can not find a game with lobby code "
                <LobbyCodeText code={gameCode} />
                "!
            </Text>
        </Box>
    </ConfirmRedirect>
)

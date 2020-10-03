import React from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'grommet'

import DelayedRedirect from 'Components/DelayedRedirect'
import Popup from 'Components/Popup'
import { getHomeUrl } from 'links'
import { LobbyCodeText } from 'Components/GameText'

export const BadGameCodeRedirect: React.FC<{ gameCode: string }> = ({
    gameCode,
}) => (
    <Popup align="center">
        <Text size="large" weight="bold">
            Uh Oh!
        </Text>
        <Text>
            We can not find a game with lobby code "
            <LobbyCodeText code={gameCode} />
            "!
        </Text>
        <Text size="small" weight={200}>
            <Link to={getHomeUrl()} style={{ textDecoration: 'none' }}>
                Click here if you are not redirected.
            </Link>
        </Text>
        <DelayedRedirect to={getHomeUrl()} delay={3000} />
    </Popup>
)

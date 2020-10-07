import React from 'react'
import { Box, Button, Main } from 'grommet'
import { Deploy, More } from 'grommet-icons'

import { Game } from 'types/Game'
import { Player } from 'types/Player'

import Players from './Players'

type LobbyProps = {
    game: Game
    players: Player[]
    hosts: Player[]
    currentPlayer: Player
}

const LobbyManager: React.FC<LobbyProps> = ({ players, hosts }) => (
    <Main fill align="center" justify="center">
        <Box pad="medium" width="large" fill="vertical">
            <Box direction="row" justify="end" gap="medium">
                <Button onClick={() => {}} icon={<Deploy />} />
                <Button onClick={() => {}} icon={<More />} />
            </Box>
            <Box
                border={{ color: 'brand-1', size: 'small' }}
                direction="row-responsive"
                gap="small"
                justify="evenly"
            >
                <Players
                    players={players.map((player) => ({
                        ...player,
                        host: hosts.includes(player),
                    }))}
                />
            </Box>
        </Box>
    </Main>
)

export default LobbyManager

/*
<Players
    players={players.map((player) => ({
        ...player,
        host: hosts.includes(player),
    }))}
/>
 */

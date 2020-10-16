import React from 'react'
import { Box, Button, Main, Text } from 'grommet'
import { Deploy, More } from 'grommet-icons'

import { Game } from 'types/Game'
import { HostPlayer } from 'types/Player'

import Players from './Players'
import { LobbyCodeText } from '../Components/GameText'

export type LobbyProps = {
    game: Game
    players: HostPlayer[]
    currentPlayer: HostPlayer
    startGame: () => void
}

const LobbyManager: React.FC<LobbyProps> = ({
    currentPlayer,
    game,
    players,
    startGame,
}) => (
    <Main fill align="center" justify="center">
        <Box pad="medium" width="large" fill="vertical">
            <Box direction="row" justify="between" gap="medium" align="center">
                <Box direction="row" pad={{ horizontal: 'medium' }}>
                    <Text>
                        Game Lobby <LobbyCodeText code={game.code} />
                    </Text>
                </Box>
                <Box direction="row">
                    <Button
                        onClick={() => startGame()}
                        icon={<Deploy />}
                        disabled={!currentPlayer.host}
                    />
                    <Button
                        onClick={() => {}}
                        icon={<More />}
                        disabled={!currentPlayer.host}
                    />
                </Box>
            </Box>
            <Box
                border={{ color: 'brand-1', size: 'small' }}
                gap="small"
                pad="medium"
                round="medium"
            >
                <Text>Players in this game:</Text>
                <Players players={players} />
            </Box>
        </Box>
    </Main>
)

export default LobbyManager

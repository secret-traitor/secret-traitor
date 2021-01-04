import React from 'react'
import { Box, Button, Main, Text } from 'grommet'
import { Close, Deploy } from 'grommet-icons'
import sort from 'lodash/sortBy'

import { Game } from 'Types/Game'
import { Player } from 'Types/Player'

import GameInfo from 'Components/GameInfo'

type PlayerCardProps = {
    player: Player
    kick?: () => void
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, kick }) => (
    <Box align="center" direction="row" pad="xsmall">
        {kick && (
            <Button icon={<Close size="small" />} disabled={player.host} />
        )}
        <Text color={player.host ? 'brand-9' : 'brand-8'}>
            {player.nickname}
        </Text>
    </Box>
)

export type LobbyProps = {
    game: Game
    players: Player[]
    currentPlayer: Player
    startGame: () => void
}

const LobbyManager: React.FC<LobbyProps> = ({
    currentPlayer,
    game,
    players,
    startGame,
}) => (
    <Main
        align="center"
        background={{ color: 'light-1', opacity: 'medium' }}
        fill
        gap="large"
        pad={{ top: 'xlarge' }}
    >
        <Box
            align="start"
            background={{ color: 'light-2', opacity: 'medium' }}
            border={{ color: 'light-3' }}
            direction="row"
            gap="medium"
            justify="center"
            margin={{ vertical: 'xlarge' }}
            pad={{ horizontal: 'medium', vertical: 'large' }}
            round="medium"
            width="large"
            height="medium"
        >
            <Box
                border={{ side: 'right' }}
                direction="column"
                justify="around"
                pad={{ right: 'medium' }}
                width="small"
                fill="vertical"
                align="start"
            >
                {sort(players, (p) => p.nickname).map((player) => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        kick={currentPlayer.host ? () => ({}) : undefined}
                    />
                ))}
            </Box>
            <Box gap="small" justify="between" fill align="center">
                <GameInfo game={game} gap="xsmall" showLabels />
                <Button
                    disabled={!currentPlayer.host && players.length > 4}
                    label="Start Game"
                    primary
                    color="brand-9"
                    icon={<Deploy />}
                    onClick={() => startGame()}
                />
            </Box>
        </Box>
    </Main>
)

export default LobbyManager

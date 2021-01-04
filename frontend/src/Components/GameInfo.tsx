import React from 'react'
import { Game } from '../Types/Game'
import { Box, Text, TextProps } from 'grommet'
import { GameStatusText, LobbyCodeText } from './GameText'
import { BoxProps } from 'grommet/components/Box'

type GameInfoProps = { game: Game; showLabels?: boolean } & BoxProps & TextProps

const GameInfo: React.FC<GameInfoProps> = ({ game, showLabels, ...props }) => (
    <Box pad="xsmall" {...(props as BoxProps)}>
        <Box direction="row" gap="xsmall" justify="between">
            {showLabels && (
                <Text textAlign="start" {...(props as TextProps)}>
                    Lobby Code:
                </Text>
            )}
            <LobbyCodeText
                gameId={game.id}
                textAlign={showLabels ? 'start' : 'end'}
                {...(props as TextProps)}
            />
        </Box>
        <Box direction="row" gap="xsmall" justify="between">
            {showLabels && (
                <Text textAlign="start" {...(props as TextProps)}>
                    Game Status:
                </Text>
            )}
            <GameStatusText
                status={game.status}
                textAlign={showLabels ? 'start' : 'end'}
                {...(props as TextProps)}
            />
        </Box>
        <Box direction="row" gap="xsmall" justify="between">
            {showLabels && (
                <Text textAlign="start" {...(props as TextProps)}>
                    Players:
                </Text>
            )}
            <Text
                textAlign={showLabels ? 'start' : 'end'}
                {...(props as TextProps)}
            >
                {game.players.length}/10
            </Text>
        </Box>
    </Box>
)

export default GameInfo

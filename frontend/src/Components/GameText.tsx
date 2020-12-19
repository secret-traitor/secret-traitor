import React from 'react'

import { GameStatus } from '../types/Game'
import { Text, TextProps } from 'grommet'

const map = {
    [GameStatus.InProgress]: { color: 'status-error', text: 'In Progress' },
    [GameStatus.InLobby]: {
        color: 'blue-3',
        text: 'In Lobby',
        joinable: true,
    },
    [GameStatus.Archived]: { color: 'status-disabled', text: 'Archived' },
    [GameStatus.Closed]: { color: 'status-disabled', text: 'Closed' },
}

export const LobbyCodeText: React.FC<{ gameId: string } & TextProps> = ({
    gameId,
    ...props
}) => (
    <Text color="brand-9" weight="bold" {...props}>
        {gameId?.toUpperCase()}
    </Text>
)

export const GameStatusText: React.FC<{ status: GameStatus } & TextProps> = ({
    status,
    ...props
}) => {
    const { color, text } = map[status]
    return (
        <Text color={color} weight="bold" {...props}>
            {text}
        </Text>
    )
}

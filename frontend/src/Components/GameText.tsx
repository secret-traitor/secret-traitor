import React from 'react'

import { GameStatus } from '../types/Game'
import { Text } from 'grommet'

const map = {
    [GameStatus.InProgress]: { color: 'status-error', text: 'In Progress' },
    [GameStatus.InLobby]: {
        color: 'status-ok',
        text: 'In Lobby',
        joinable: true,
    },
    [GameStatus.Archived]: { color: 'status-disabled', text: 'Archived' },
    [GameStatus.Closed]: { color: 'status-disabled', text: 'Closed' },
}

export const LobbyCodeText: React.FC<{ code: string }> = ({ code }) => (
    <Text color="brand-3" weight="bold">
        {code?.toUpperCase()}
    </Text>
)

export const GameStatusText: React.FC<{ status: GameStatus }> = ({
    status,
}) => {
    const { color, text } = map[status]
    return (
        <Text color={color} weight="bold">
            {text}
        </Text>
    )
}

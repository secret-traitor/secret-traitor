import React from 'react'
import { Text } from 'grommet'
import { PlayerRole } from './types'

export const RoleText: React.FC<{ role: PlayerRole }> = ({ role }) => {
    const color = role === PlayerRole.Ally ? 'ally-2' : 'enemy-2'
    const text =
        role === PlayerRole.EnemyLeader ? 'Enemy Leader' : role.toString()
    return <Text color={color}>{text}</Text>
}

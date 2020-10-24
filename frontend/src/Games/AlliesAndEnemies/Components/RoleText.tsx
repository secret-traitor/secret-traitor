import React from 'react'
import { Text } from 'grommet'

import { PlayerRole } from 'Games/AlliesAndEnemies/types'

const ColorRecord: Record<PlayerRole | 'default', string> = {
    [PlayerRole.Ally]: 'ally-2',
    [PlayerRole.Enemy]: 'enemy-2',
    [PlayerRole.EnemyLeader]: 'enemy-2',
    default: 'dark-2',
}

const TextRecord: Record<PlayerRole | 'default', string> = {
    [PlayerRole.Ally]: PlayerRole.Ally,
    [PlayerRole.Enemy]: PlayerRole.Enemy,
    [PlayerRole.EnemyLeader]: 'Enemy Leader',
    default: '???',
}

export const RoleText: React.FC<{ role?: PlayerRole }> = ({ role }) => (
    <Text color={ColorRecord[role || 'default']}>
        {TextRecord[role || 'default']}
    </Text>
)

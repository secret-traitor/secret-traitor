import React from 'react'
import { Text } from 'grommet'

import { PlayerRole } from 'Games/AlliesAndEnemies/types'

const ColorRecord: Record<PlayerRole, string> = {
    [PlayerRole.Ally]: 'ally-2',
    [PlayerRole.Enemy]: 'enemy-2',
    [PlayerRole.EnemyLeader]: 'enemy-2',
    [PlayerRole.Unknown]: 'dark-2',
}

const TextRecord: Record<PlayerRole, string> = {
    [PlayerRole.Ally]: PlayerRole.Ally,
    [PlayerRole.Enemy]: PlayerRole.Enemy,
    [PlayerRole.EnemyLeader]: 'Enemy Leader',
    [PlayerRole.Unknown]: '???',
}

export const RoleText: React.FC<{ role: PlayerRole }> = ({ role }) => (
    <Text color={ColorRecord[role || 'default']}>
        {TextRecord[role || 'default']}
    </Text>
)

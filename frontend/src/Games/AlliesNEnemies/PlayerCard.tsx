import React from 'react'
import { PlayerRole } from './types'
import { Box, Text } from 'grommet'

import { RoleText } from './RoleText'

export const PlayerCard: React.FC<{ role: PlayerRole; nickname: string }> = ({
    role,
    nickname,
}) => (
    <Box
        background={{
            color: role === PlayerRole.Ally ? 'ally-1' : 'enemy-1',
            opacity: role === PlayerRole.EnemyLeader ? 'strong' : 'medium',
        }}
        width="small"
        height="xsmall"
        border={{ color: 'grey', style: 'dotted', size: 'medium' }}
        align="center"
        justify="center"
        direction="column"
        gap="small"
    >
        <Text>{nickname}</Text>
        <RoleText role={role} />
    </Box>
)

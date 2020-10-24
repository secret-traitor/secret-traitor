import React from 'react'
import { Box, Text } from 'grommet'

import { CurrentOffice, PlayerRole } from 'Games/AlliesAndEnemies/types'
import { CurrentOfficeText } from 'Games/AlliesAndEnemies/Components/CurrentOfficeText'
import { RoleText } from 'Games/AlliesAndEnemies/Components/RoleText'

const ColorRecord: Record<PlayerRole | 'default', string> = {
    [PlayerRole.Ally]: 'ally-1',
    [PlayerRole.Enemy]: 'enemy-1',
    [PlayerRole.EnemyLeader]: 'enemy-1',
    default: 'dark-6',
}

export const PlayerCard: React.FC<{
    currentOffice?: CurrentOffice
    isForViewingPlayer?: boolean
    nickname: string
    order?: number
    role?: PlayerRole
}> = ({ currentOffice, isForViewingPlayer, nickname, order, role }) => (
    <Box
        background={{
            color: ColorRecord[role || 'default'],
            opacity: role === PlayerRole.EnemyLeader ? 'strong' : 'medium',
        }}
        width="small"
        height="xsmall"
        border={{ color: 'grey', style: 'dotted', size: 'medium' }}
        direction="row"
        round="small"
        style={{
            userSelect: 'none',
        }}
    >
        <Box align="start" pad={{ left: 'xsmall' }} width="16px">
            <Text size="medium" color="grey">
                {order}
            </Text>
        </Box>
        <Box
            align="center"
            justify="evenly"
            direction="column"
            fill="horizontal"
        >
            <CurrentOfficeText office={currentOffice} />
            <Text>{isForViewingPlayer ? `${nickname} (you)` : nickname}</Text>
            <RoleText role={role} />
        </Box>
        <Box align="start" pad={{ right: 'xsmall' }} width="16px" />
    </Box>
)

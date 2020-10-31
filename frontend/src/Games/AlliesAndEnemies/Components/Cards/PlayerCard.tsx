import React from 'react'
import { Box, Text } from 'grommet'

import {
    PlayerRole,
    PlayerState,
    PlayerStatus,
} from 'Games/AlliesAndEnemies/types'
import PlayerStatusText from 'Games/AlliesAndEnemies/Components/PlayerStatusText'
import { RoleText } from 'Games/AlliesAndEnemies/Components/RoleText'

const ColorRecord: Record<PlayerRole | 'default', string> = {
    [PlayerRole.Ally]: 'ally-1',
    [PlayerRole.Enemy]: 'enemy-1',
    [PlayerRole.EnemyLeader]: 'enemy-1',
    default: 'dark-6',
}

export type PlayerCardProps = Omit<PlayerState, 'position'> & {
    isForViewingPlayer?: boolean
    order?: number
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
    isForViewingPlayer,
    nickname,
    order,
    role,
    status,
}) => (
    <Box
        background={{
            color: ColorRecord[role || 'default'],
            opacity:
                status === PlayerStatus.Executed
                    ? 'weak'
                    : role !== PlayerRole.EnemyLeader
                    ? 'medium'
                    : 'strong',
        }}
        width="small"
        height="xsmall"
        border={{
            color: status === PlayerStatus.Executed ? 'lightgrey' : 'grey',
            style: 'dotted',
            size: 'medium',
        }}
        direction="row"
        round="small"
        style={{
            userSelect: 'none',
            opacity: status === PlayerStatus.Executed ? 'weak' : 'inherit',
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
            <PlayerStatusText status={status} />
            <Text>{isForViewingPlayer ? `${nickname} (you)` : nickname}</Text>
            <RoleText role={role} />
        </Box>
        <Box align="start" pad={{ right: 'xsmall' }} width="16px" />
    </Box>
)

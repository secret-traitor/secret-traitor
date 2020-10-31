import React from 'react'
import { Text } from 'grommet'

import { PlayerStatus } from 'Games/AlliesAndEnemies/types'

const PlayerStatusTextColorRecord: Record<PlayerStatus, string> = {
    Executed: 'dark-5',
    Governor: 'brand-4',
    None: 'white',
    President: 'brand-4',
}

const PlayerStatusText: React.FC<{
    status: PlayerStatus
}> = ({ status }) =>
    status === PlayerStatus.None ? (
        <Text />
    ) : (
        <Text color={PlayerStatusTextColorRecord[status]} weight="bold">
            {status}
        </Text>
    )
export default PlayerStatusText

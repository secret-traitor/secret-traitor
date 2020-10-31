import React from 'react'
import { Box, Text } from 'grommet'

import { Faction, Victory, VictoryType } from 'Games/AlliesAndEnemies/types'

const VictoryScreenTextRecord: Record<VictoryType, string> = {
    Cards: 'playing enough cards',
    Election: 'electing the Enemy Leader',
    Execution: 'executing the Enemy Leader',
}

const VictoryScreenTeamRecord: Record<Faction, string> = {
    Ally: 'Allies',
    Enemy: 'Enemies',
}

const VictoryScreen: React.FC<Victory> = ({ team, message, type }) => (
    <Box dir="row" gap="medium" align="center">
        <Text textAlign="center" weight="bold">
            {message}
        </Text>
        <Text textAlign="center">{`${VictoryScreenTeamRecord[team]} win by ${VictoryScreenTextRecord[type]}!`}</Text>
    </Box>
)

export default VictoryScreen

import React from 'react'
import { Box, Text } from 'grommet'

import { AlliesAndEnemiesState, TurnStatus } from 'Games/AlliesAndEnemies/types'

const WaitingOnTextRecord: Record<TurnStatus, any> = {
    [TurnStatus.Nomination]: 'nominate someone.',
    [TurnStatus.Election]: 'vote.',
    [TurnStatus.FirstHand]: 'choose the first policy to discard.',
    [TurnStatus.SecondHand]: 'choose the second policy to discard.',
    [TurnStatus.TakeAction]: 'take the current action.',
    [TurnStatus.Veto]: 'to decide on a veto.',
}
const WaitingOn: React.FC<AlliesAndEnemiesState> = (props) => {
    const what = WaitingOnTextRecord[props.currentTurn.status]
    const who =
        props.currentTurn.status === TurnStatus.SecondHand
            ? props.currentTurn.nominatedPlayer?.nickname
            : props.currentTurn.waitingOn.nickname
    return (
        <Box
            direction="row-responsive"
            align="center"
            justify="center"
            margin="small"
        >
            <Text>
                You are waiting on {who} to {what}
            </Text>
        </Box>
    )
}
export default WaitingOn

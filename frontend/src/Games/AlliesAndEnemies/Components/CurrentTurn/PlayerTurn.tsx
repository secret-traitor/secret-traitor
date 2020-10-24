import { AlliesAndEnemiesState, TurnStatus } from 'Games/AlliesAndEnemies/types'
import React from 'react'
import { Nomination } from './Nomination'
import { Election } from './Election'
import { FirstHand } from './FirstHand'
import { SecondHand } from './SecondHand'
import { TakeAction } from './TakeAction'

const PlayerTurnComponentFnRecord: Record<
    TurnStatus,
    (props: AlliesAndEnemiesState) => React.ReactElement
> = {
    [TurnStatus.Nomination]: (props) => <Nomination {...props} />,
    [TurnStatus.Election]: (props) => <Election {...props} />,
    [TurnStatus.FirstHand]: (props) => <FirstHand {...props} />,
    [TurnStatus.SecondHand]: (props) => <SecondHand {...props} />,
    [TurnStatus.TakeAction]: (props) => <TakeAction {...props} />,
}
export const PlayerTurn: React.FC<AlliesAndEnemiesState> = (props) =>
    PlayerTurnComponentFnRecord[props.currentTurn.status](props)
// PlayerTurnComponentFnRecord[TurnStatus.Nomination](props)

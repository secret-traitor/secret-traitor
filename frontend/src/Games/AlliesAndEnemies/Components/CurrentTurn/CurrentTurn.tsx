import React from 'react'

import {
    AlliesAndEnemiesState,
    PlayerStatus,
    TurnStatus,
} from 'Games/AlliesAndEnemies/types'

import LoadingScreen from 'Components/LoadingScreen'

const PlayerTurn = React.lazy(() => import('./PlayerTurn'))
const WaitingOn = React.lazy(() => import('./WaitingOn'))
const VictoryScreen = React.lazy(() => import('./VictoryScreen'))

type CheckIsPlayerTurnFn = (props: AlliesAndEnemiesState) => boolean

const isCurrentPosition: CheckIsPlayerTurnFn = ({
    viewingPlayer,
    currentTurn,
}) => viewingPlayer.position === currentTurn.position
const isNomiated: CheckIsPlayerTurnFn = ({ viewingPlayer, currentTurn }) =>
    (currentTurn.nominatedPlayer || false) &&
    viewingPlayer.position === currentTurn.nominatedPlayer.position
const isNotExecutedFn: CheckIsPlayerTurnFn = ({ viewingPlayer }) =>
    viewingPlayer.status !== PlayerStatus.Executed

const CheckIsPlayerTurnFnRecord: Record<TurnStatus, CheckIsPlayerTurnFn> = {
    [TurnStatus.Election]: isNotExecutedFn,
    [TurnStatus.FirstHand]: isCurrentPosition,
    [TurnStatus.Nomination]: isCurrentPosition,
    [TurnStatus.SecondHand]: isNomiated,
    [TurnStatus.TakeAction]: isCurrentPosition,
    [TurnStatus.Veto]: isCurrentPosition,
}

export const CurrentTurn: React.FC<AlliesAndEnemiesState> = (props) => {
    const victory = props.victoryStatus
    // TODO: display a message that the player has been executed and they should not discuss the game further
    const isPlayerExecuted =
        props.viewingPlayer.status === PlayerStatus.Executed
    const isPlayerTurn =
        CheckIsPlayerTurnFnRecord[props.currentTurn.status](props) &&
        !isPlayerExecuted
    return (
        <React.Suspense fallback={<LoadingScreen />}>
            {victory && <VictoryScreen {...victory} />}
            {!victory && !isPlayerTurn && <WaitingOn {...props} />}
            {!victory && isPlayerTurn && <PlayerTurn {...props} />}
        </React.Suspense>
    )
}

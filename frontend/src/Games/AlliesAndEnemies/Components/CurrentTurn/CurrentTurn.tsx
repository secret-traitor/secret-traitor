import React from 'react'

import { AlliesAndEnemiesState, TurnStatus } from 'Games/AlliesAndEnemies/types'

import LoadingScreen from 'Components/LoadingScreen'

const PlayerTurn = React.lazy(() => import('./PlayerTurn'))
const WaitingOn = React.lazy(() => import('./WaitingOn'))
const VictoryScreen = React.lazy(() => import('./VictoryScreen'))

const nominationFn = ({ viewingPlayer, currentTurn }: AlliesAndEnemiesState) =>
    viewingPlayer.position === currentTurn.position
const firstHandFn = ({ viewingPlayer, currentTurn }: AlliesAndEnemiesState) =>
    viewingPlayer.position === currentTurn.position
const secondHandFn = ({ viewingPlayer, currentTurn }: AlliesAndEnemiesState) =>
    (currentTurn.nominatedPlayer || false) &&
    viewingPlayer.position === currentTurn.nominatedPlayer?.position
const takeActionFn = ({ viewingPlayer, currentTurn }: AlliesAndEnemiesState) =>
    viewingPlayer.position === currentTurn.position

const ViewingPlayerTurnFnRecord: Record<
    TurnStatus,
    (props: AlliesAndEnemiesState) => boolean
> = {
    [TurnStatus.Nomination]: nominationFn,
    [TurnStatus.Election]: () => true,
    [TurnStatus.FirstHand]: firstHandFn,
    [TurnStatus.SecondHand]: secondHandFn,
    [TurnStatus.TakeAction]: takeActionFn,
}

const getViewingPlayerTurn = (props: AlliesAndEnemiesState): boolean =>
    ViewingPlayerTurnFnRecord[props.currentTurn.status](props)

export const CurrentTurn: React.FC<AlliesAndEnemiesState> = (props) => {
    const victory = props.victoryStatus
    const playerTurn = getViewingPlayerTurn(props)
    return (
        <React.Suspense fallback={<LoadingScreen />}>
            {victory && <VictoryScreen {...victory} />}
            {!victory && playerTurn && <PlayerTurn {...props} />}
            {!victory && !playerTurn && <WaitingOn {...props} />}
        </React.Suspense>
    )
}

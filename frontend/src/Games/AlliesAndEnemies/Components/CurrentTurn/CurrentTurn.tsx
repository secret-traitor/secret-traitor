import React from 'react'

import { AlliesAndEnemiesState, TurnStatus } from 'Games/AlliesAndEnemies/types'

import { WaitingOn } from './WaitingOn'
import { PlayerTurn } from './PlayerTurn'

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

export const CurrentTurn: React.FC<AlliesAndEnemiesState> = (props) =>
    getViewingPlayerTurn(props) ? (
        <PlayerTurn {...props} />
    ) : (
        <WaitingOn {...props} />
    )

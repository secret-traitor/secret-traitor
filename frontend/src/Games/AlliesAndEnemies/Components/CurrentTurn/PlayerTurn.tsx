import React from 'react'

import { AlliesAndEnemiesState, TurnStatus } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

const TakeAction = React.lazy(() => import('./TakeAction'))
const Nomination = React.lazy(() => import('./Nomination'))
const Election = React.lazy(() => import('./Election'))
const FirstHand = React.lazy(() => import('./FirstHand'))
const SecondHand = React.lazy(() => import('./SecondHand'))

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
const PlayerTurn: React.FC<AlliesAndEnemiesState> = (props) => (
    <React.Suspense fallback={<LoadingScreen />}>
        {PlayerTurnComponentFnRecord[props.currentTurn.status](props)}
    </React.Suspense>
)
export default PlayerTurn

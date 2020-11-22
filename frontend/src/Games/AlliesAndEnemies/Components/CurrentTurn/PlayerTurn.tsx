import React from 'react'

import { AlliesAndEnemiesState, TurnStatus } from 'Games/AlliesAndEnemies/types'
import LoadingScreen from 'Components/LoadingScreen'

const Election = React.lazy(() => import('./Election'))
const FirstHand = React.lazy(() => import('./FirstHand'))
const Nomination = React.lazy(() => import('./Nomination'))
const SecondHand = React.lazy(() => import('./SecondHand'))
const TakeAction = React.lazy(() => import('./TakeAction'))
const VoteVeto = React.lazy(() => import('./VoteVeto'))

const PlayerTurnComponentFnRecord: Record<
    TurnStatus,
    (props: AlliesAndEnemiesState) => React.ReactElement
> = {
    [TurnStatus.Election]: (props) => <Election {...props} />,
    [TurnStatus.FirstHand]: (props) => <FirstHand {...props} />,
    [TurnStatus.Nomination]: (props) => <Nomination {...props} />,
    [TurnStatus.SecondHand]: (props) => <SecondHand {...props} />,
    [TurnStatus.TakeAction]: (props) => <TakeAction {...props} />,
    [TurnStatus.Veto]: (props) => <VoteVeto {...props} />,
}
const PlayerTurn: React.FC<AlliesAndEnemiesState> = (props) => (
    <React.Suspense fallback={<LoadingScreen />}>
        {PlayerTurnComponentFnRecord[props.currentTurn.status](props)}
    </React.Suspense>
)
export default PlayerTurn

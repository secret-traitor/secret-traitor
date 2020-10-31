import React from 'react'

import LoadingScreen from 'Components/LoadingScreen'
import {
    AlliesAndEnemiesState,
    BoardAction,
} from 'Games/AlliesAndEnemies/types'

const Execution = React.lazy(() => import('./Execution'))
const InvestigateLoyalty = React.lazy(() => import('./InvestigateLoyalty'))
const PolicyPeek = React.lazy(() => import('./PolicyPeek'))
const SpecialElection = React.lazy(() => import('./SpecialElection'))

const BoardActionRecord: Record<
    BoardAction,
    (props: AlliesAndEnemiesState) => React.ReactElement
> = {
    [BoardAction.None]: () => <>Uh Oh.</>,
    [BoardAction.InvestigateLoyalty]: (props: AlliesAndEnemiesState) => (
        <InvestigateLoyalty {...props} />
    ),
    [BoardAction.SpecialElection]: (props: AlliesAndEnemiesState) => (
        <SpecialElection {...props} />
    ),
    [BoardAction.PolicyPeek]: (props: AlliesAndEnemiesState) => (
        <PolicyPeek {...props} />
    ),
    [BoardAction.Execution]: (props: AlliesAndEnemiesState) => (
        <Execution {...props} />
    ),
}

const TakeAction: React.FC<AlliesAndEnemiesState> = (props) => (
    <React.Suspense fallback={<LoadingScreen />}>
        {console.log(props.currentTurn.action)}
        {props.currentTurn.action ? (
            BoardActionRecord[props.currentTurn.action](props)
        ) : (
            <>Uh oh</>
        )}
    </React.Suspense>
)

export default TakeAction

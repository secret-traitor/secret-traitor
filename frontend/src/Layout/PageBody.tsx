import React, { Suspense } from 'react'
import { Redirect } from 'react-router'
import { Route, RouteComponentProps, Switch } from 'react-router-dom'

import LoadingScreen from 'Components/LoadingScreen'
import * as links from 'Links'
import { useLocationSearchParams } from 'Hooks/location'

const Play = React.lazy(() => import('Pages/Play'))
const Home = React.lazy(() => import('Pages/Home'))
const Error = React.lazy(() => import('Pages/Error'))

const HomeRouter: React.FC<RouteComponentProps> = () => <Home />
const PlayRouter: React.FC<RouteComponentProps<{
    playerId: string
    gameId: string
}>> = (props) => <Play {...props.match?.params} />
const ErrorRouter: React.FC<RouteComponentProps> = () => (
    <Error type={useLocationSearchParams().get('type') || undefined} />
)

const PageBody: React.FC = () => (
    <Suspense fallback={<LoadingScreen />}>
        <Switch>
            <Route exact path={links.homePath} component={HomeRouter} />
            <Route exact path={links.playPath} component={PlayRouter} />
            <Route exact path={links.errorPath} component={ErrorRouter} />
            <Route
                exact
                path="*"
                component={() => <Redirect to={links.homePath} />}
            />
        </Switch>
    </Suspense>
)

export default PageBody

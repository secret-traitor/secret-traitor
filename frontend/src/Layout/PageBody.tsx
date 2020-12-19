import React, { Suspense } from 'react'
import { Box } from 'grommet'
import { Route, RouteComponentProps, Switch } from 'react-router-dom'

import LoadingScreen from 'Components/LoadingScreen'

const Play = React.lazy(() => import('Pages/Play'))
const Home = React.lazy(() => import('Pages/Home'))

const HomeRouter: React.FC<RouteComponentProps> = () => <Home />
const PlayRouter: React.FC<RouteComponentProps<{
    playerId: string
    gameId: string
}>> = (props) => <Play {...props.match?.params} />

const PageBody: React.FC = () => (
    <Suspense fallback={<LoadingScreen />}>
        <Box fill overflow="hidden">
            <Switch>
                <Route exact path="/" component={HomeRouter} />
                <Route
                    exact
                    path="/play/:gameId/:playerId"
                    component={PlayRouter}
                />
            </Switch>
        </Box>
    </Suspense>
)

export default PageBody

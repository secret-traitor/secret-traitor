import React, { Suspense } from 'react'
import { Box } from 'grommet'
import { Route, RouteComponentProps, Switch } from 'react-router-dom'

import LoadingScreen from 'Components/LoadingScreen'
import Play from 'Pages/Play'
const HomeRouter = React.lazy(() => import('Pages/Home'))
const PlayRouter: React.FC<RouteComponentProps<{
    playerId: string
    gameId: string
}>> = (props) => <Play {...props.match?.params} />

const Router = () => (
    <Switch>
        <Route exact path="/" component={HomeRouter} />
        <Route exact path="/play/:gameId/:playerId" component={PlayRouter} />
    </Switch>
)

type PageBodyProps = {
    size: string
}

const PageBody: React.FC<PageBodyProps> = () => (
    <Suspense fallback={<LoadingScreen />}>
        <Box overflow="hidden" background={{ color: 'brand-4', light: '1000' }}>
            <Router />
        </Box>
    </Suspense>
)

export default PageBody

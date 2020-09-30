import React, { Suspense } from 'react'
import { Box } from 'grommet'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom'

import { getJoinUrl } from 'links'
import { usePlayerCode } from 'types/Player'

import Create from 'Pages/Create'
import Home from 'Pages/Home'
import Play from 'Pages/Play'
import Join from 'Pages/Join'
import { LoadingScreen } from '../../Components/Loader'

const HomeRouter = () => <Home />

const CreateRouter = () => <Create />

const JoinRouter: React.FC<RouteComponentProps<{
    playerCode?: string
    gameCode: string
}>> = (props) => {
    const playerCodeCookie = usePlayerCode()
    return props.match?.params?.playerCode ? (
        <Join
            gameCode={props.match?.params?.gameCode}
            playerCode={props.match?.params?.playerCode}
        />
    ) : (
        <Redirect
            to={getJoinUrl({
                gameCode: props.match?.params?.gameCode as string,
                playerCode: playerCodeCookie,
            })}
        />
    )
}

const PlayRouter: React.FC<RouteComponentProps<{
    playerCode: string
    gameCode: string
}>> = (props) => <Play {...props.match?.params} />

const Router = () => (
    <Switch>
        <Route exact path="/" component={HomeRouter} />
        <Route exact path="/create" component={CreateRouter} />
        <Route exact path="/join/:gameCode" component={JoinRouter} />
        <Route
            exact
            path="/join/:gameCode/:playerCode"
            component={JoinRouter}
        />
        <Route
            exact
            path="/play/:gameCode/:playerCode"
            component={PlayRouter}
        />
    </Switch>
)

type PageBodyProps = {
    size: string
}

const PageBody: React.FC<PageBodyProps> = () => (
    <Suspense fallback={<LoadingScreen />}>
        <Box overflow="hidden">
            <Router />
        </Box>
    </Suspense>
)

export default PageBody

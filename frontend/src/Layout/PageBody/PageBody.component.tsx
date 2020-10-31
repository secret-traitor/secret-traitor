import React, { Suspense } from 'react'
import { Box } from 'grommet'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom'

import Create from 'Pages/Create'
import Home from 'Pages/Home'
import Join from 'Pages/Join'
import LoadingScreen from 'Components/LoadingScreen'
import Play from 'Pages/Play'
import { getJoinUrl } from 'links'
import { usePlayerId } from 'types/Player'

const HomeRouter = () => <Home />

const CreateRouter = () => <Create />

const JoinRouter: React.FC<RouteComponentProps<{
    playerId?: string
    gameId: string
}>> = (props) => {
    const playerIdCookie = usePlayerId()
    return props.match?.params?.playerId ? (
        <Join
            gameId={props.match?.params?.gameId}
            playerId={props.match?.params?.playerId}
        />
    ) : (
        <Redirect
            to={getJoinUrl({
                gameId: props.match?.params?.gameId as string,
                playerId: playerIdCookie,
            })}
        />
    )
}

const PlayRouter: React.FC<RouteComponentProps<{
    playerId: string
    gameId: string
}>> = (props) => <Play {...props.match?.params} />

const Router = () => (
    <Switch>
        <Route exact path="/" component={HomeRouter} />
        <Route exact path="/create" component={CreateRouter} />
        <Route exact path="/join/:gameId" component={JoinRouter} />
        <Route exact path="/join/:gameId/:playerId" component={JoinRouter} />
        <Route exact path="/play/:gameId/:playerId" component={PlayRouter} />
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

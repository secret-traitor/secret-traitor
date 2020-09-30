import React, { Suspense } from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import Join from './Join.component'
import { gql } from 'apollo-boost'
import { LoadingScreen } from 'Components/Loader'
import { ErrorToast } from 'Components/Toast'
import DelayedRedirect from 'Components/DelayedRedirect'
import { getHomeUrl } from 'links'

type Game = {
    code: string
}

type Player = {
    code: string
    nickname: string
}

const GAME_PLAYERS_QUERY = gql`
    query gameWithPlayers($gameCode: String!) {
        game(code: $gameCode) {
            code
            players {
                code
                nickname
            }
        }
    }
`

const useGameWithPlayers = (
    gameCode: string
): [{ game: Game; players: Player[] }, boolean, any] => {
    const { data, loading, error } = useQuery(GAME_PLAYERS_QUERY, {
        variables: { gameCode },
    })
    const game: Game = get(data, 'game') as Game
    const players: Player[] = get(data, 'game.players') as Player[]
    return [{ game, players }, loading, error]
}

type JoinContainerProps = {
    gameCode: string
    playerCode: string
}

const JoinContainer: React.FC<JoinContainerProps> = ({
    gameCode,
    playerCode,
}) => {
    const [
        { game, players },
        loadingGameWithPlayers,
        errorInGameWithPlayers,
    ] = useGameWithPlayers(gameCode)
    if (loadingGameWithPlayers && !errorInGameWithPlayers) {
        return <LoadingScreen />
    }
    if (errorInGameWithPlayers) {
        return <>Uh Oh! {errorInGameWithPlayers}</>
    }
    if (!game) {
        return (
            <>
                <ErrorToast position="top">
                    A game with lobby code "{gameCode}" does not exist!
                </ErrorToast>
                <DelayedRedirect to={getHomeUrl()} delay={3000} />
            </>
        )
    }
    return (
        <>
            <Suspense fallback={<LoadingScreen />}>
                <Join
                    gameCode={gameCode}
                    join={(nickname) => {
                        console.log(nickname)
                    }}
                    playerCode={playerCode}
                />
            </Suspense>
        </>
    )
}

export default JoinContainer

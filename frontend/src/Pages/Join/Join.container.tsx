import React from 'react'

import DelayedRedirect from 'Components/DelayedRedirect'
import LoadingScreen from 'Components/LoadingScreen'
import { ErrorToast, SuccessToast } from 'Components/Toast'
import { getHomeUrl, getPlayUrl } from 'links'

import Join from './Join.component'
import { useGameWithPlayers, useJoinGame } from './hooks'
import { Redirect } from 'react-router'
import { log } from 'util'

const BadGameCodeRedirect: React.FC<{ gameCode: string }> = ({ gameCode }) => (
    <>
        <ErrorToast position="top">
            A game with lobby code "{gameCode}" does not exist!
        </ErrorToast>
        <DelayedRedirect to={getHomeUrl()} delay={3000} />
    </>
)

const JoiningGameRedirect: React.FC<{
    playerCode: string
    gameCode: string
}> = ({ playerCode, gameCode }) => (
    <>
        <SuccessToast position="top">Joining game...</SuccessToast>
        <LoadingScreen />
        <Redirect to={getPlayUrl({ playerCode, gameCode })} />
    </>
)

type JoinContainerProps = {
    gameCode: string
    playerCode: string
}

const JoinContainer: React.FC<JoinContainerProps> = ({
    gameCode,
    playerCode,
}) => {
    const [
        { game, player },
        loadingGameWithPlayers,
        errorInGameWithPlayers,
        refetchGameWithPlayers,
    ] = useGameWithPlayers(gameCode, playerCode)

    const {
        error: errorJoin,
        join: joinMutation,
        loading: loadingJoin,
    } = useJoinGame()

    const join = async (nickname: string) => {
        if (game && nickname) {
            await joinMutation({
                gameId: game.id,
                playerCode: playerCode,
                playerNickname: nickname,
            })
            refetchGameWithPlayers()
        }
    }

    const loading =
        (loadingGameWithPlayers && !errorInGameWithPlayers) ||
        (loadingJoin && !errorJoin)

    if (errorInGameWithPlayers) {
        return <>Uh Oh! {errorInGameWithPlayers}</>
    }

    if (errorJoin) {
        return <>Uh Oh! {errorJoin}</>
    }

    return (
        <>
            {loading && <LoadingScreen />}
            {!loading && !game && <BadGameCodeRedirect gameCode={gameCode} />}
            {player?.nickname && (
                <JoiningGameRedirect
                    gameCode={gameCode}
                    playerCode={playerCode}
                />
            )}
            <Join gameCode={gameCode} playerCode={playerCode} join={join} />
        </>
    )
}

export default JoinContainer

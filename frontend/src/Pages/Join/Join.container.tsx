import React from 'react'
import LoadingScreen from 'Components/LoadingScreen'

import Join from './Join.component'
import { BadGameCodeRedirect } from './BadGameCodeRedirect'
import { JoiningGameRedirect } from './JoiningGameRedirect'
import { useGameWithPlayers, useJoinGame } from './hooks'

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
            const result = await joinMutation({
                gameCode,
                playerCode,
                playerNickname: nickname,
            })
            if (result && !loadingJoin) {
                refetchGameWithPlayers()
            }
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

    if (loading) return <LoadingScreen />
    if (!loading && !game) return <BadGameCodeRedirect gameCode={gameCode} />
    if (player?.nickname)
        return (
            <JoiningGameRedirect gameCode={gameCode} playerCode={playerCode} />
        )
    return <Join gameCode={gameCode} join={join} />
}

export default JoinContainer

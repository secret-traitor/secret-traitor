import React from 'react'
import LoadingScreen from 'Components/LoadingScreen'

import Join from './Join.component'
import { BadGameRedirect } from './BadGameRedirect'
import { JoiningGameRedirect } from './JoiningGameRedirect'
import { useGameWithPlayers, useJoinGame } from './hooks'

type JoinContainerProps = {
    gameId: string
    playerId: string
}

const JoinContainer: React.FC<JoinContainerProps> = ({ gameId, playerId }) => {
    const {
        game,
        player,
        loading: loadingGameWithPlayers,
        error: errorInGameWithPlayers,
        refetch: refetchGameWithPlayers,
    } = useGameWithPlayers(gameId, playerId)

    const [
        joinMutation,
        { error: errorJoin, loading: loadingJoin },
    ] = useJoinGame()

    const join = async (nickname: string) => {
        if (game && nickname) {
            const result = await joinMutation({
                gameId,
                playerId,
                playerNickname: nickname,
            })
            if (result && !loadingJoin) {
                await refetchGameWithPlayers()
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

    return (
        <>
            {!loading && !game && <BadGameRedirect gameId={gameId} />}
            {player?.nickname && (
                <JoiningGameRedirect gameId={gameId} playerId={playerId} />
            )}
            {loading && <LoadingScreen />}
            <Join gameId={gameId} join={join} />
        </>
    )
}

export default JoinContainer

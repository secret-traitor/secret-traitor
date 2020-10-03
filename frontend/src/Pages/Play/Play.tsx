import React from 'react'
import { Redirect } from 'react-router'

import GameManager from 'GameManager'
import LoadingScreen from 'Components/LoadingScreen'
import { getJoinUrl } from 'links'
import { usePageTitle } from 'hooks'

import { useGamePlayer } from './hooks'

const Play: React.FC<{
    playerCode: string
    gameCode: string
}> = (props) => {
    usePageTitle('Play | Secret Traitor')
    const { gameCode, playerCode } = props
    const [{ game, player }, loadingGameWithPlayers] = useGamePlayer(
        gameCode,
        playerCode
    )
    if (!loadingGameWithPlayers && (!game || !player?.nickname)) {
        return <Redirect to={getJoinUrl({ gameCode, playerCode })} />
    }
    return (
        <>
            {loadingGameWithPlayers && <LoadingScreen />}
            <GameManager {...props} />
        </>
    )
}

export default Play

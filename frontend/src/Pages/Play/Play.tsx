import React from 'react'
import { Redirect } from 'react-router'

import ConfirmRedirect from 'Components/ConfirmRedirect'
import LoadingScreen from 'Components/LoadingScreen'
import GameManager from 'GameManager'
import LobbyManager from 'LobbyManager'
import { usePageTitle } from 'hooks'
import { getHomeUrl, getJoinUrl } from 'links'
import { GameStatus, Game } from 'types/Game'
import { Player } from 'types/Player'

import { useGamePlayer, usePlayGame } from './hooks'

const Play: React.FC<{
    playerCode: string
    gameCode: string
}> = (props) => {
    usePageTitle('Play | Secret Traitor')
    const { gameCode, playerCode } = props
    const {
        gameId,
        playerId,
        playerNickname,
        called: calledGamePlayer,
        loading: loadingGamePlayer,
    } = useGamePlayer(gameCode, playerCode)

    const {
        game,
        players,
        called: calledPlayGame,
        loading: loadingPlayGame,
    } = usePlayGame(gameId, playerId)

    console.log({
        game: { id: gameId, code: gameCode },
        player: {
            id: playerId,
            code: playerCode,
            nickname: playerNickname,
        },
    })

    if (calledGamePlayer && !loadingGamePlayer && !playerNickname) {
        console.log('I would redirect here!')
        // return <Redirect push to={getJoinUrl({ gameCode, playerCode })} />
    }

    const currentPlayer = {
        id: playerId,
        code: playerCode,
        nickname: playerNickname,
    }

    const loading = loadingGamePlayer || loadingPlayGame
    const ok =
        playerId &&
        playerCode &&
        playerNickname &&
        game &&
        players !== undefined

    return (
        <>
            {loading && <LoadingScreen />}
            {ok && game?.status === GameStatus.InLobby && (
                <LobbyManager
                    currentPlayer={currentPlayer as Player}
                    players={players as Player[]}
                    game={game}
                />
            )}
            {game?.status === GameStatus.InProgress && <GameManager />}
            {game?.status === GameStatus.Closed && (
                <ConfirmRedirect push to={getHomeUrl()}>
                    This game has been closed.
                </ConfirmRedirect>
            )}
            {game?.status === GameStatus.Archived && (
                <ConfirmRedirect push to={getHomeUrl()}>
                    It is not possible to join an archived game.
                </ConfirmRedirect>
            )}
        </>
    )
}

export default Play

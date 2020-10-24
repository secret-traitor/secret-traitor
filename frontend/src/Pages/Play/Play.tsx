import React from 'react'
import { Redirect } from 'react-router'

import ConfirmRedirect from 'Components/ConfirmRedirect'
import GameManager from 'GameManager'
import LoadingScreen from 'Components/LoadingScreen'
import LobbyManager from 'LobbyManager'
import { GameState, GameStatus } from 'types/Game'
import { getHomeUrl, getJoinUrl } from 'links'
import { usePageTitle } from 'hooks'

import { usePlayGame, usePlayId, useStartGame } from './hooks'

const Play: React.FC<{
    playerId: string
    gameId: string
}> = (props) => {
    usePageTitle('Play | Secret Traitor')
    const { gameId, playerId } = props
    const details = usePlayId(gameId, playerId)
    const { playId, loading: loadingDetails } = details
    const play = usePlayGame(gameId, playerId, playId)
    const { game, players, player, loading: loadingPlay, state } = play
    const { startGame: startGameMutation } = useStartGame(playId)
    const startGame = async () => {
        if (playId) await startGameMutation()
    }
    const loading = loadingDetails || loadingPlay

    if (!loading && !player?.nickname) {
        const redirect = <Redirect push to={getJoinUrl({ gameId, playerId })} />
        if (false)
            return <Redirect push to={getJoinUrl({ gameId, playerId })} />
        console.log(play)
        return <>Uh Oh! I dont have a name for this player</>
    }
    if (!loading && !(player || game)) {
        return <>Uh Oh! I couldn't look up this game</>
    }
    console.log('playId:', playId)
    return (
        <>
            {loading && <LoadingScreen />}
            {game?.status === GameStatus.InLobby &&
                player &&
                players &&
                game && (
                    <LobbyManager
                        currentPlayer={player}
                        game={game}
                        players={players}
                        startGame={startGame}
                    />
                )}
            {game?.status === GameStatus.InProgress && playId && (
                <GameManager {...(state as GameState)} />
            )}
            {(game?.status === GameStatus.Closed ||
                game?.status === GameStatus.Archived) && (
                <ConfirmRedirect push to={getHomeUrl()}>
                    This game has been closed or archived.
                </ConfirmRedirect>
            )}
        </>
    )
}

export default Play

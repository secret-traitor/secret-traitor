import React from 'react'
import { Redirect } from 'react-router'

import ConfirmRedirect from 'Components/ConfirmRedirect'
import GameManager from 'GameManager'
import LoadingScreen from 'Components/LoadingScreen'
import LobbyManager from 'LobbyManager'
import { GameStatus } from 'types/Game'
import { getHomeUrl, getJoinUrl } from 'links'
import { usePageTitle } from 'hooks'

import { useGameDetails, usePlayGame, useStartGame } from './hooks'

function useComponentState(gameCode: string, playerCode: string) {
    const details = useGameDetails(gameCode, playerCode)
    const { gameId, playId, loading: loadingDetails } = details
    const play = usePlayGame(gameId, playId)
    const { game, players, state, player, loading: loadingPlay } = play
    const { startGame: startGameMutation } = useStartGame(playId)
    const startGame = async () => {
        if (playId) await startGameMutation()
    }
    const loading = loadingDetails || loadingPlay
    return { game, loading, player, players, startGame, state, playId }
}

const Play: React.FC<{
    playerCode: string
    gameCode: string
}> = (props) => {
    usePageTitle('Play | Secret Traitor')
    const { gameCode, playerCode } = props
    const {
        game,
        loading,
        player,
        players,
        startGame,
        state,
        playId,
    } = useComponentState(gameCode, playerCode)

    // if (!loading && !player?.nickname) {
    //     //<Redirect push to={getJoinUrl({ gameCode, playerCode })} />
    //     return <>{player?.nickname}</>
    // }
    if (!loading && !(player || game || state)) {
        return <>Uh Oh!</>
    }

    console.log(state)

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
                <GameManager {...state} playId={playId} />
            )}
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

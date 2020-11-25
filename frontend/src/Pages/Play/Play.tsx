import React from 'react'

import ConfirmRedirect from 'Components/ConfirmRedirect'
import LoadingScreen from 'Components/LoadingScreen'

import { GameState, GameStatus } from 'types/Game'
import { getHomeUrl, getJoinUrl } from 'links'
import { usePageTitle } from 'hooks/document'

import { usePlayGame, useStartGame } from './hooks'

const GameManager = React.lazy(() => import('GameManager'))
const LobbyManager = React.lazy(() => import('LobbyManager'))

const Play: React.FC<{
    playerId: string
    gameId: string
}> = (props) => {
    usePageTitle('Play | Secret Traitor')
    const { gameId, playerId } = props
    const playGameResults = usePlayGame(gameId, playerId)
    const {
        game,
        players,
        player,
        loading: loadingPlay,
        state,
    } = playGameResults
    const [startGameMutation] = useStartGame()
    const startGame = async () => {
        if (gameId && playerId) await startGameMutation(gameId, playerId)
    }
    const loading = loadingPlay
    if (!loading && !player?.nickname) {
        return (
            <ConfirmRedirect push to={getJoinUrl({ gameId, playerId })}>
                You need to join this game first!
            </ConfirmRedirect>
        )
    }
    if (!loading && !(player || game)) {
        return (
            <ConfirmRedirect push to={getHomeUrl()}>
                This game does not exists or is not playable.
            </ConfirmRedirect>
        )
    }
    return (
        <React.Suspense fallback={<LoadingScreen />}>
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
            {game?.status === GameStatus.InProgress && player && game && (
                <GameManager {...(state as GameState)} />
            )}
            {(game?.status === GameStatus.Closed ||
                game?.status === GameStatus.Archived) && (
                <ConfirmRedirect push to={getHomeUrl()}>
                    This game has been closed or archived.
                </ConfirmRedirect>
            )}
        </React.Suspense>
    )
}

export default React.memo(Play)

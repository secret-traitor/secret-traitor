import React from 'react'
import { useHistory } from 'react-router-dom'

import LoadingScreen from 'Components/LoadingScreen'
import { usePageTitle } from 'Hooks/document'
import { getPlayUrl } from 'Links'
import { GameType } from 'Types/Game'
import { usePlayerId, usePlayerNickname } from 'Types/Player'

import Home from './Home.component'
import HomeErrorPage from './Components/ErrorPage'
import { usePollGames, useCreateGame, useJoinGame } from './hooks'

const HomeContainer: React.FC = () => {
    usePageTitle('Home | Secret Traitor')
    const history = useHistory()
    const playerId = usePlayerId()
    const [playerNickname, setPlayerNickname] = usePlayerNickname()
    const [joinFn, joinResults] = useJoinGame(playerId)
    const join = async (gameId: string, playerNickname: string) => {
        if (playerNickname) {
            const results = await joinFn(gameId, playerNickname)
            if (results?.game) {
                setPlayerNickname(playerNickname)
                history.push(getPlayUrl(results.game.id, playerId))
            } else {
            }
        }
    }
    const [createFn, createResults] = useCreateGame(playerId)
    const create = async () => {
        if (playerNickname) {
            const results = await createFn(GameType.AlliesNEnemies)
            if (results.game) {
                await join(results.game.id, playerNickname)
            }
        }
    }
    const {
        games,
        loading: loadingGames,
        error: errorGames,
        refetch: refetchGames,
    } = usePollGames()
    if (errorGames) {
        return <HomeErrorPage error={errorGames} />
    }
    const loading = loadingGames || joinResults.loading || createResults.loading
    return (
        <>
            {loading && <LoadingScreen />}
            <Home
                games={games ?? []}
                refresh={() => refetchGames()}
                join={join}
                nickname={playerNickname}
                setNickname={setPlayerNickname}
                create={create}
            />
        </>
    )
}

export default HomeContainer

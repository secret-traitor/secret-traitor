import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import { useClipboard } from 'use-clipboard-copy'

import LoadingScreen from 'Components/LoadingScreen'
import { GameStatus } from 'types/Game'
import { SuccessToast } from 'Components/Toast'
import { usePageTitle, usePollingQuery } from 'hooks'

import Home from './Home.component'

export type GameResult = {
    id: string
    code: string
    status: GameStatus
}

const GAMES_QUERY = gql`
    query getGames {
        games: allGames {
            id
            code
            status
        }
    }
`

const usePollGames = (): [GameResult[], boolean, any, () => void] => {
    const { data, loading, error, refetch } = usePollingQuery(
        GAMES_QUERY,
        {},
        6000
    )
    const games: GameResult[] = data?.games as GameResult[]
    return [games, loading, error, refetch]
}

const HomeContainer: React.FC = () => {
    usePageTitle('Home | Secret Traitor')
    const [showCopySuccess, setShowCopySuccess] = useState(false)
    const { copy } = useClipboard({
        onSuccess: () => setShowCopySuccess(true),
        copiedTimeout: 25000,
    })
    const [games, loadingGames, gamesError, refetchGames] = usePollGames()
    if (gamesError || (!loadingGames && !games)) {
        return <>Uh oh</>
    }
    if (loadingGames) {
        return <LoadingScreen />
    }
    return (
        <>
            {showCopySuccess && (
                <SuccessToast onClose={() => setShowCopySuccess(false)}>
                    Copied game link to clipboard!
                </SuccessToast>
            )}
            <Home
                games={games}
                refresh={() => refetchGames()}
                copy={(text) => copy(text)}
                showGameDetails={() => {}}
            />
        </>
    )
}

export default HomeContainer

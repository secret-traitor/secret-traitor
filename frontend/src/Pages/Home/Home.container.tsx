import React, { useState } from 'react'
import { useClipboard } from 'use-clipboard-copy'

import LoadingScreen from 'Components/LoadingScreen'
import { SuccessToast } from 'Components/Toast'
import { usePageTitle } from 'hooks/document'

import Home from './Home.component'
import { usePollGames } from './hooks'

const HomeContainer: React.FC = () => {
    usePageTitle('Home | Secret Traitor')
    const [showCopySuccess, setShowCopySuccess] = useState(false)
    const { copy } = useClipboard({
        onSuccess: () => setShowCopySuccess(true),
        copiedTimeout: 25000,
    })
    const {
        games,
        loading: loadingGames,
        error: gamesError,
        refetch: refetchGames,
    } = usePollGames()
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

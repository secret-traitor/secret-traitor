import React from 'react'
import { Main, Button, Box } from 'grommet'
import { Refresh, Add } from 'grommet-icons'

import { CreateRouterButton } from 'links'

import Games from './Games'
import { GameResult } from './types'
import { EmptyGames } from './EmptyGames'

type HomeProps = {
    copy: (text: string) => void
    games: GameResult[]
    refresh: () => void
    showGameDetails: (gameId: string) => void
}

const Home: React.FC<HomeProps> = ({
    copy,
    games,
    refresh,
    showGameDetails,
}) => (
    <Main fill align="center" justify="center">
        <Box pad="medium" width="large" fill="vertical">
            <Box direction="row" justify="between">
                <Box align="center" justify="start" width="xsmall">
                    <CreateRouterButton icon={<Add />} />
                </Box>
                <Box align="center" justify="end" width="xsmall">
                    <Button onClick={refresh} icon={<Refresh />} />
                </Box>
            </Box>
            <Box
                border={{ color: 'brand-1', size: 'small' }}
                direction="row"
                height={{ min: 'small', max: 'large' }}
                justify="start"
                overflow="scroll"
                pad="medium"
                round="medium"
                wrap
            >
                {games.length > 0 ? (
                    <Games games={games} copy={copy} more={showGameDetails} />
                ) : (
                    <EmptyGames />
                )}
            </Box>
        </Box>
    </Main>
)

export default Home

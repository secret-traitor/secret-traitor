import React from 'react'
import { Main, Button, Box } from 'grommet'
import * as Icons from 'grommet-icons'

import { CreateRouterButton } from 'links'
import BoxSection from 'Components/Box'

import Games, { EmptyGames } from './Games'
import { GameResult } from './Home.container'

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
    <Main fill flex align="center" justify="center">
        <Box flex direction="column" pad="medium" width="large">
            <Box direction="row-responsive" justify="between">
                <Box align="center" justify="start" width="xsmall">
                    <CreateRouterButton icon={<Icons.Add />} />
                </Box>
                <Box align="center" justify="end" width="xsmall">
                    <Button onClick={refresh} icon={<Icons.Refresh />} />
                </Box>
            </Box>
            <BoxSection direction="row-responsive">
                {games.length > 0 ? (
                    <Games games={games} copy={copy} more={showGameDetails} />
                ) : (
                    <EmptyGames />
                )}
            </BoxSection>
        </Box>
    </Main>
)

export default Home

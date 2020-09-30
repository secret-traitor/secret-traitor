import React from 'react'

import { Box, Button, Card, CardBody, CardFooter, Text } from 'grommet'
import { AddCircle, More, CirclePlay, Link } from 'grommet-icons'

import { RouterButton } from 'Components/RouterButton'
import { GameStatusText, LobbyCodeText } from 'Components/GameText'
import { GameStatus } from 'types/Game'
import { createAbsolutePath, getCreateUrl, getJoinUrl } from 'links'

import { GameResult } from './Home.container'

export const EmptyGames: React.FC = () => (
    <Box fill justify="center" align="center">
        <RouterButton size="large" path={getCreateUrl()}>
            <Box flex align="center" justify="center">
                <Box align="center">
                    <Text color="light-4">There are no games currently.</Text>
                </Box>
                <AddCircle color="light-4" size="xlarge" />
                <Box align="center">
                    <Text color="light-4">
                        Click here To create a new game.
                    </Text>
                </Box>
            </Box>
        </RouterButton>
    </Box>
)

export type GameCardProps = {
    game: GameResult
    copy: () => void
    more: () => void
}

const GameCard: React.FC<GameCardProps> = ({
    game: { code, status },
    copy,
    more,
}) => (
    <Card
        height="small"
        width="small"
        background="light-1"
        margin="small"
        color="brand-5"
        wrap
    >
        <CardBody pad="small">
            <Box flex direction="row-responsive" justify="between">
                <Box flex justify="evenly">
                    <Box>
                        <Text size="xsmall">Lobby Code:</Text>
                        <LobbyCodeText code={code} />
                    </Box>
                    <Box>
                        <Text size="xsmall">Game Status:</Text>
                        <GameStatusText status={status} />
                    </Box>
                </Box>
                <Box pad="none">
                    <Button
                        style={{ padding: 'unset' }}
                        icon={<More size="15" color="light-5" />}
                        onClick={() => more()}
                    />
                </Box>
            </Box>
        </CardBody>
        <CardFooter pad={{ horizontal: 'small' }} background="brand-2">
            <RouterButton
                hoverIndicator
                icon={<CirclePlay color="brand-4" />}
                path={getJoinUrl({ gameCode: code })}
                disabled={status in [GameStatus.Archived, GameStatus.Closed]}
            />
            <Button
                hoverIndicator
                icon={<Link color="brand-4" />}
                onClick={() => copy()}
            />
        </CardFooter>
    </Card>
)

export type GamesProps = {
    games: GameResult[]
    copy: (value: string) => void
    more: (id: string) => void
}

const Games: React.FC<GamesProps> = ({ games, copy, more }) => (
    <>
        {games.map((game) => (
            <GameCard
                key={game.id}
                game={game}
                copy={() =>
                    copy(
                        createAbsolutePath(getJoinUrl({ gameCode: game.code }))
                    )
                }
                more={() => more(game.id)}
            />
        ))}
    </>
)

export default Games

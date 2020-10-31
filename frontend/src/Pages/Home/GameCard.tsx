import React from 'react'
import { Box, Button, Card, CardBody, CardFooter, Text } from 'grommet'
import { CirclePlay, Link, More } from 'grommet-icons'

import { Game, GameStatus } from 'types/Game'
import { GameStatusText, LobbyCodeText } from 'Components/GameText'
import { getJoinUrl } from 'links'
import { RouterButton } from 'Components/RouterButton'

export type GameCardProps = {
    game: Game
    copy: () => void
    more: () => void
}
export const GameCard: React.FC<GameCardProps> = ({ copy, game, more }) => {
    const { id: gameId, status } = game
    return (
        <Card
            background="light-1"
            color="brand-5"
            height="small"
            margin="small"
            width="small"
        >
            <CardBody pad="small">
                <Box flex direction="row" justify="between">
                    <Box flex justify="evenly">
                        <Box>
                            <Text size="xsmall">Lobby Code:</Text>
                            <LobbyCodeText gameId={gameId} />
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
                    disabled={
                        status in [GameStatus.Archived, GameStatus.Closed]
                    }
                    hoverIndicator
                    icon={<CirclePlay color="brand-4" />}
                    path={getJoinUrl({ gameId })}
                />
                <Button
                    hoverIndicator
                    icon={<Link color="brand-4" />}
                    onClick={() => copy()}
                />
            </CardFooter>
        </Card>
    )
}

import React from 'react'
import { Box, Button, Card, CardBody, CardFooter, Text } from 'grommet'
import { CirclePlay, Link, More } from 'grommet-icons'

import { GameStatus } from 'types/Game'
import { GameStatusText, LobbyCodeText } from 'Components/GameText'
import { getJoinUrl } from 'links'
import { RouterButton } from 'Components/RouterButton'

import { GameResult } from './types'

export type GameCardProps = {
    game: GameResult
    copy: () => void
    more: () => void
}
export const GameCard: React.FC<GameCardProps> = ({
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

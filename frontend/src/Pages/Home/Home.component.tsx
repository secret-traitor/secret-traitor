import React, { useState } from 'react'
import { Box, Button, Form, FormField, TextInput, Text } from 'grommet'
import { AddCircle, CirclePlay } from 'grommet-icons'

import { Game } from 'Types/Game'
import GameInfo from 'Components/GameInfo'
import Main from 'Components/Main'

type HomeProps = {
    create: () => void
    games: Game[]
    join: (gameId: string, nickname: string) => void
    nickname?: string
    refresh: () => void
    setNickname: (nickname: string) => void
}

const Home: React.FC<HomeProps> = ({
    create,
    games,
    join,
    nickname,
    setNickname,
}) => {
    const [gameId, setGameId] = useState<string>()
    const submit = () => joinGame(gameId, nickname)
    const joinGame = (
        gameId: string | undefined,
        nickname: string | undefined
    ) =>
        joinEnabled(gameId, nickname) && gameId && nickname
            ? join(gameId, nickname)
            : {}
    const joinEnabled = (
        gameId: string | undefined,
        nickname: string | undefined
    ) => !!gameId && !!nickname && gameId.length === 6
    const suggestions = games
        .filter((g, i) =>
            gameId ? g.id.toLowerCase().includes(gameId.toLowerCase()) : i < 5
        )
        .map((g) => ({
            label: <GameInfo size="small" game={g} />,
            value: g.id,
        }))
    return (
        <Main
            align="center"
            background={{
                color: `brand-8`,
                opacity: 'medium',
            }}
            fill
            gap="large"
            pad={{ top: 'xlarge' }}
        >
            <Text size="xxlarge" weight="bold">
                S e c r e t T r a i t o r
            </Text>
            <Form onSubmit={submit}>
                <Box
                    align="center"
                    background={{ color: 'light-1', opacity: 0.4 }}
                    border={{ color: 'light-3' }}
                    direction="row"
                    gap="large"
                    justify="center"
                    onKeyDown={(e) => (e.key === 'Enter' ? submit() : {})}
                    pad={{ vertical: 'large', horizontal: 'xlarge' }}
                    round="medium"
                >
                    <Box
                        direction="row"
                        align="center"
                        justify="between"
                        gap="medium"
                    >
                        <Box width="small">
                            <FormField
                                htmlFor="text-input-nickname"
                                label="Nickname"
                                name="Nickname"
                            >
                                <TextInput
                                    id="text-input-nickname"
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                    size="large"
                                    value={nickname ?? ''}
                                />
                            </FormField>
                        </Box>
                        <Box width="120px">
                            <FormField
                                htmlFor="text-input-gameCode"
                                label="Game Code"
                                name="Game Code"
                            >
                                <TextInput
                                    id="text-input-gameCode"
                                    maxLength={6}
                                    minLength={6}
                                    onChange={(e) => setGameId(e.target.value)}
                                    onSelect={({ suggestion }) => {
                                        setGameId(suggestion.value)
                                    }}
                                    size="large"
                                    value={gameId?.toUpperCase() ?? ''}
                                    suggestions={suggestions}
                                />
                            </FormField>
                        </Box>
                    </Box>
                    <Box gap="small" direction="column" justify="around">
                        <Button
                            color="dark-3"
                            disabled={!nickname}
                            icon={<AddCircle />}
                            id="button-newGame"
                            label="New Game"
                            onClick={() => create()}
                            primary
                            reverse
                            size="medium"
                        />

                        <Button
                            color="brand-8"
                            disabled={!joinEnabled(gameId, nickname)}
                            icon={<CirclePlay />}
                            id="button-submit"
                            label="Join Game"
                            primary
                            reverse
                            size="medium"
                            type="submit"
                        />
                    </Box>
                </Box>
            </Form>
        </Main>
    )
}

export default Home

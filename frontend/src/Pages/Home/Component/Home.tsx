import React, { useEffect, useRef, useState } from 'react'
import { Box, Form, Main, Text } from 'grommet'

import { Game } from 'types/Game'

import { Section } from './Section'
import { Suggestions } from './Suggestions'
import { Inputs } from './Inputs'
import { Buttons } from './Buttons'

type HomeProps = {
    create: () => void
    games: Game[]
    join: (gameId: string, nickname: string) => void
    nickname?: string
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
    const joinEnabled = useRef<boolean>(false)
    const joinGame = useRef<() => void>(() => () => ({}))
    useEffect(() => {
        if (!!gameId && !!nickname && gameId.length === 6) {
            joinEnabled.current = true
            joinGame.current = () => join(gameId.toLowerCase(), nickname)
        } else {
            joinEnabled.current = false
            joinGame.current = () => ({})
        }
    }, [gameId, join, joinEnabled, joinGame, nickname])
    return (
        <Main
            background={{
                color: `brand-9`,
                opacity: 'medium',
            }}
        >
            <Form onSubmit={joinGame.current}>
                <Box
                    align="center"
                    gap="large"
                    pad={{ top: 'xlarge' }}
                    onKeyDown={(e) =>
                        e.key === 'Enter' ? joinGame.current() : {}
                    }
                >
                    <Text size="xxlarge" weight="bold">
                        Secret Traitor
                    </Text>
                    <Section>
                        <Inputs
                            nickname={nickname}
                            setNickname={setNickname}
                            gameId={gameId}
                            setGameId={setGameId}
                        />
                        <Buttons
                            create={create}
                            joinEnabled={joinEnabled.current}
                            nickname={nickname}
                        />
                    </Section>
                    <Section justify="center">
                        <Suggestions
                            gameId={gameId}
                            games={games}
                            joinGame={joinGame.current}
                            setGameId={setGameId}
                        />
                    </Section>
                </Box>
            </Form>
        </Main>
    )
}

export default Home

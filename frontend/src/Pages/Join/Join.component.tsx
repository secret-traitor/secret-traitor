import React, { useState } from 'react'
import { Box, Main, Text, TextInput, Button } from 'grommet'
import { CirclePlay } from 'grommet-icons'

import BoxSection from 'Components/Box'
import { LobbyCodeText } from 'Components/GameText'

type JoinProps = {
    gameCode: string
    playerCode: string
    join: (nickname: string) => void
}

const Join: React.FC<JoinProps> = ({ gameCode, playerCode, join }) => {
    const [nickname, setNickname] = useState<string>('')
    const joinDisabled = !nickname
    return (
        <Main fill flex align="center" justify="center">
            <Box flex pad="medium" width="large">
                <BoxSection
                    direction="row-responsive"
                    height={{ min: 'xsmall', max: 'large' }}
                    flex
                    align="center"
                    justify="center"
                >
                    <Box align="center">
                        <Box
                            align="center"
                            direction="row-responsive"
                            justify="between"
                            height="xxsmall"
                        >
                            <Text>
                                Joining lobby <LobbyCodeText code={gameCode} />
                            </Text>
                        </Box>
                    </Box>
                    <Box direction="row-responsive" justify="between">
                        <Box align="center" justify="start" width="large">
                            <TextInput
                                focusIndicator
                                placeholder="Set a nickname"
                                value={nickname}
                                onChange={(event) =>
                                    setNickname(event.target.value as string)
                                }
                                onKeyDown={({ key }) => {
                                    if (!joinDisabled && key === 'Enter') {
                                        join(nickname)
                                    }
                                }}
                            />
                        </Box>
                        <Box align="center" justify="end" width="xsmall">
                            <Button
                                icon={<CirclePlay color="brand-4" />}
                                disabled={joinDisabled}
                                onClick={() => join(nickname)}
                            />
                        </Box>
                    </Box>
                </BoxSection>
            </Box>
        </Main>
    )
}

export default Join

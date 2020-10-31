import React, { useState } from 'react'
import { Box, Main, Text, TextInput, Button } from 'grommet'
import { CirclePlay } from 'grommet-icons'

import { LobbyCodeText } from 'Components/GameText'

type JoinProps = {
    gameId: string
    join: (nickname: string) => void
}

const Join: React.FC<JoinProps> = ({ gameId, join }) => {
    const [nickname, setNickname] = useState<string>('')
    const joinDisabled = !nickname
    return (
        <Main fill flex align="center" justify="center">
            <Box flex pad="medium" width="large">
                <Box
                    border={{ color: 'brand-1', size: 'small' }}
                    height={{ min: 'small', max: 'large' }}
                    justify="start"
                    overflow="scroll"
                    pad="medium"
                    round="medium"
                    wrap
                    direction="row-responsive"
                    flex
                    align="center"
                >
                    <Box align="center">
                        <Box
                            align="center"
                            direction="row-responsive"
                            justify="between"
                            height="xxsmall"
                        >
                            <Text>
                                Joining lobby <LobbyCodeText gameId={gameId} />
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
                </Box>
            </Box>
        </Main>
    )
}

export default Join

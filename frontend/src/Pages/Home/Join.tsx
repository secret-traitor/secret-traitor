import React from 'react'
import { Box, FormField, TextInput } from 'grommet'

type JoinProps = {
    gameId: string
    nickname: string | undefined
    onGameIdChange: (gameId: string) => void
    onNicknameChange: (nickname: string) => void
}
export const Join: React.FC<JoinProps> = ({
    gameId,
    nickname,
    onGameIdChange,
    onNicknameChange,
}) => {
    return (
        <Box
            direction="row"
            align="center"
            justify="between"
            gap="medium"
            style={{ color: 'brand-3' }}
        >
            <Box width="large">
                <FormField
                    htmlFor="text-input-nickname"
                    label="Nickname"
                    name="Nickname"
                >
                    <TextInput
                        id="text-input-nickname"
                        onChange={(event) =>
                            onNicknameChange(event.target.value)
                        }
                        size="large"
                        value={nickname ?? ''}
                    />
                </FormField>
            </Box>
            <Box width="320px">
                <FormField
                    htmlFor="text-input-gameCode"
                    label="Game Code"
                    name="Game Code"
                >
                    <TextInput
                        id="text-input-gameCode"
                        maxLength={6}
                        minLength={6}
                        onChange={(event) => onGameIdChange(event.target.value)}
                        size="large"
                        value={gameId?.toUpperCase() ?? ''}
                    />
                </FormField>
            </Box>
        </Box>
    )
}

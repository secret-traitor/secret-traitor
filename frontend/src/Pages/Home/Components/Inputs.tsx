import React from 'react'
import { Box, FormField, TextInput } from 'grommet'

export const Inputs: React.FC<{
    gameId?: string
    nickname?: string
    setGameId: (gameId: string) => void
    setNickname: (nickname: string) => void
}> = ({ gameId, nickname, setGameId, setNickname }) => (
    <Box direction="row" align="center" justify="between" gap="medium">
        <Box width="small">
            <NicknameInput nickname={nickname} setNickname={setNickname} />
        </Box>
        <Box width="120px">
            <GameIdInput gameId={gameId} setGameId={setGameId} />
        </Box>
    </Box>
)

export const GameIdInput: React.FC<{
    gameId?: string
    setGameId: (gameId: string) => void
}> = ({ gameId, setGameId }) => (
    <FormField
        htmlFor="text-input-gameCode"
        label="Game Code"
        name="Game Code"
        style={{ color: 'black' }}
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
        />
    </FormField>
)

export const NicknameInput: React.FC<{
    nickname: string | undefined
    setNickname: (nickname: string) => void
}> = ({ nickname, setNickname }) => (
    <FormField
        htmlFor="text-input-nickname"
        label="Nickname"
        name="Nickname"
        style={{ color: 'black' }}
    >
        <TextInput
            id="text-input-nickname"
            onChange={(e) => setNickname(e.target.value)}
            size="large"
            value={nickname ?? ''}
        />
    </FormField>
)

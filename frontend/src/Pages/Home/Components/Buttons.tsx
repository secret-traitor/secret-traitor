import React from 'react'
import { Box, Button } from 'grommet'
import { AddCircle, CirclePlay } from 'grommet-icons'

export const Buttons: React.FC<{
    nickname?: string
    create: () => void
    joinEnabled: boolean
}> = ({ nickname, joinEnabled, create }) => (
    <Box gap="small" direction="column" justify="around">
        <NewGameButton nickname={nickname} create={create} />
        <JoinGameButton joinEnabled={joinEnabled} />
    </Box>
)

const NewGameButton: React.FC<{
    nickname: string | undefined
    create: () => void
}> = ({ nickname, create }) => (
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
)

const JoinGameButton: React.FC<{ joinEnabled: boolean }> = ({
    joinEnabled,
}) => (
    <Button
        color="brand-8"
        disabled={!joinEnabled}
        icon={<CirclePlay />}
        id="button-submit"
        label="Join Game"
        primary
        reverse
        size="medium"
        type="submit"
    />
)

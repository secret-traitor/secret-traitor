import React from 'react'
import { Game } from '../../../Types/Game'
import GameInfo from '../../../Components/GameInfo'
import { Box } from 'grommet'

export const Suggestions: React.FC<{
    games: Game[]
    gameId?: string
    setGameId: (gameId: string) => void
    joinGame: () => void
}> = ({ games, gameId, setGameId }) => (
    <Box gap="medium" direction="row" wrap justify="start">
        {games
            .filter((g, i) =>
                gameId
                    ? g.id.toLowerCase().includes(gameId.toLowerCase())
                    : i < 5
            )
            .map((g) => (
                <Box key={g.id} onClick={() => setGameId(g.id)} width="90px">
                    <GameInfo size="small" game={g} />
                </Box>
            ))}
    </Box>
)

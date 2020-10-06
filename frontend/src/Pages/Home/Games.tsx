import React from 'react'
import { createAbsolutePath, getJoinUrl } from 'links'

import { GameResult } from './types'
import { GameCard } from './GameCard'

export type GamesProps = {
    games: GameResult[]
    copy: (value: string) => void
    more: (id: string) => void
}

const Games: React.FC<GamesProps> = ({ games, copy, more }) => (
    <>
        {games.map((game) => (
            <GameCard
                key={game.id}
                game={game}
                copy={() => {
                    const path = createAbsolutePath(
                        getJoinUrl({ gameCode: game.code })
                    )
                    copy(path)
                }}
                more={() => more(game.id)}
            />
        ))}
    </>
)

export default Games

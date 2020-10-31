import React from 'react'
import { createAbsolutePath, getJoinUrl } from 'links'

import { Game } from 'types/Game'

import { GameCard } from './GameCard'

export type GamesProps = {
    games: Game[]
    copy: (value: string) => void
    more: (id: string) => void
}

export const Games: React.FC<GamesProps> = ({ games, copy, more }) => (
    <>
        {games.map((game) => (
            <GameCard
                key={game.id}
                game={game}
                copy={() => {
                    const path = createAbsolutePath(
                        getJoinUrl({ gameId: game.id })
                    )
                    copy(path)
                }}
                more={() => more(game.id)}
            />
        ))}
    </>
)

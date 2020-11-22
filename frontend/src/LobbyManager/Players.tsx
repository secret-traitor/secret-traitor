import React from 'react'
import { Box } from 'grommet'
import { Player } from '../types/Player'

type PlayerCardProps = {
    player: Player
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => (
    <Box pad="xxsmall">{player.nickname}</Box>
)

type PlayersProps = {
    players: Player[]
}

const Players: React.FC<PlayersProps> = ({ players }) => (
    <>
        {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
        ))}
    </>
)

export default Players

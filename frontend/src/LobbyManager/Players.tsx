import React from 'react'
import { Button } from 'grommet'

import { Player } from 'types/Player'

type HostPlayer = Player & { host: boolean }

type PlayerCardProps = {
    player: HostPlayer
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => (
    <Button primary color="brand-1" label={player.nickname} />
)

type PlayersProps = {
    players: HostPlayer[]
}

const Players: React.FC<PlayersProps> = ({ players }) => (
    <>
        {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
        ))}
    </>
)

export default Players

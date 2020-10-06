import React from 'react'

import { Game } from 'types/Game'
import { Player } from 'types/Player'

type LobbyProps = {
    game: Game
    players: Player[]
    currentPlayer: Player
}

const LobbyManager: React.FC<LobbyProps> = ({
    game,
    players,
    currentPlayer,
}) => <>Wooo lobby!</>

export default LobbyManager

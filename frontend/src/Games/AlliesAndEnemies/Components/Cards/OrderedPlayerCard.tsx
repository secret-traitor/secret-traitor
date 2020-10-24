import React from 'react'

import { PlayerState } from 'Games/AlliesAndEnemies/types'

import { PlayerCard } from './PlayerCard'

export const OrderedPlayerCard: React.FC<{
    player: PlayerState
    isForViewingPlayer: boolean
}> = ({ player, isForViewingPlayer }) => (
    <PlayerCard
        {...player}
        isForViewingPlayer={isForViewingPlayer}
        // position is the index, add +1 for display
        order={player.position + 1}
    />
)

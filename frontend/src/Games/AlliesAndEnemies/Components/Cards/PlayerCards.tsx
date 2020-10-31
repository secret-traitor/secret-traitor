import React, { useState } from 'react'
import { Box, Button } from 'grommet'

import { PlayerState, TurnState } from 'Games/AlliesAndEnemies/types'

import { CardWrapper } from './CardWrapper'
import { OrderedPlayerCard } from './OrderedPlayerCard'
import { Selectable } from './CardSelector'

export type PlayersProps = {
    currentRound?: TurnState
    players: PlayerState[]
    selectable?: Selectable
    viewingPlayer: PlayerState
}

export const PlayerCards: React.FC<PlayersProps> = (props) => {
    const { players, selectable, viewingPlayer } = props
    const [selected, setSelected] = useState<PlayerState>()
    return (
        <Box align="center" justify="center" direction="column" gap="small">
            <Box align="center" justify="center" direction="row" wrap>
                {players.map((player) => (
                    <CardWrapper
                        key={`${player.position}-${player.id}`}
                        selectedCard={player}
                        isSelected={selected}
                        setSelectedCard={setSelected}
                        {...props}
                    >
                        <OrderedPlayerCard
                            player={player}
                            isForViewingPlayer={
                                viewingPlayer.position === player.position
                            }
                        />
                    </CardWrapper>
                ))}
            </Box>
            {selectable && (
                <Button
                    onClick={() => {
                        if (selected) selectable.onSubmit(selected)
                    }}
                    disabled={!selected}
                    primary
                    label={selectable.label ?? 'Submit'}
                    color="brand-3"
                    size="large"
                />
            )}
        </Box>
    )
}

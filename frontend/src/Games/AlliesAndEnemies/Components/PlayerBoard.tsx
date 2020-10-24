import React from 'react'
import { AlliesAndEnemiesState } from 'Games/AlliesAndEnemies/types'
import Section from 'Components/Box'

import { PlayerCards } from './Cards/PlayerCards'

export const PlayerBoard: React.FC<AlliesAndEnemiesState> = ({
    viewingPlayer,
    currentTurn,
    players,
}) => {
    return (
        <Section
            direction="row-responsive"
            gap="medium"
            height={{ min: 'xsmall', max: 'large' }}
            align="center"
            justify="center"
            margin="small"
            width="xlarge"
        >
            <PlayerCards
                viewingPlayer={viewingPlayer}
                currentPosition={currentTurn?.position}
                players={players}
            />
        </Section>
    )
}

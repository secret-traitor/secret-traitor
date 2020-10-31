import React, { ReactElement } from 'react'
import { Box } from 'grommet'

import { Faction } from 'Games/AlliesAndEnemies/types'

export const PolicyCard: React.FC<{ suit: Faction; active?: boolean }> = ({
    active = false,
    children,
    suit,
}) => (
    <Box
        background={{
            color: suit === Faction.Ally ? 'ally-1' : 'enemy-1',
            opacity: active ? 'strong' : 'medium',
        }}
        width="xsmall"
        height="small"
        border={{ color: 'grey', style: 'dotted', size: 'medium' }}
        align="center"
        justify="center"
        round="small"
        style={{
            userSelect: 'none',
        }}
    >
        {children}
    </Box>
)

export const PolicyCardRow: React.FC<{
    cards: {
        active?: boolean
        icon?: ReactElement
        suit: Faction
    }[]
}> = ({ cards }) => (
    <>
        {cards.map((c, i) => (
            <PolicyCard key={c.suit.toString() + i} {...c}>
                {c.icon}
            </PolicyCard>
        ))}
    </>
)

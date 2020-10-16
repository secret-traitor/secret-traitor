import React, { ReactElement } from 'react'
import { Box } from 'grommet'
import { CardSuit } from './types'

export const PolicyCard: React.FC<{ suit: CardSuit; active: boolean }> = ({
    active,
    children,
    suit,
}) => (
    <Box
        background={{
            color: suit === CardSuit.Ally ? 'ally-1' : 'enemy-1',
            opacity: active ? 'strong' : 'medium',
        }}
        width="xsmall"
        height="small"
        border={{ color: 'grey', style: 'dotted', size: 'medium' }}
        align="center"
        justify="center"
    >
        {children}
    </Box>
)

export const PolicyCardRow: React.FC<{
    cards: {
        active: boolean
        icon?: ReactElement
        suit: CardSuit
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

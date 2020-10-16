import React, { ReactElement } from 'react'
import { Box } from 'grommet'
import { Trophy } from 'grommet-icons'
import { CardSuit } from './types'

export const Card: React.FC<{ suit: CardSuit; active: boolean }> = ({
    active,
    children,
    suit,
}) => (
    <Box
        background={{
            color: suit === CardSuit.Ally ? 'ally' : 'enemy',
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

export const CardRow: React.FC<{
    cards: {
        active: boolean
        icon?: ReactElement
        suit: CardSuit
    }[]
}> = ({ cards }) => (
    <>
        {cards.map((c, i) => (
            <Card key={c.suit.toString() + i} {...c}>
                {console.log(i === cards.length - 1)}
                {c.icon}
            </Card>
        ))}
    </>
)

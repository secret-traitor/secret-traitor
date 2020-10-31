import React from 'react'
import { Box } from 'grommet'

import { PlayerState } from 'Games/AlliesAndEnemies/types'

import { CardBorder, WrapperBorderType } from './CardBorder'
import { Selectable } from './CardSelector'

const getBorderType = (
    isCurrentPlayer: boolean,
    isHighlighted: boolean,
    disabled: boolean
) => {
    let border: WrapperBorderType = 'none'
    if (isCurrentPlayer) {
        border = 'current'
    }
    if (isHighlighted) {
        border = 'highlighted'
    }
    if (disabled) {
        border = 'disabled'
    }
    return border
}

export const CardWrapper: React.FC<{
    currentPosition?: number
    isSelected?: PlayerState
    selectable?: Selectable
    selectedCard: PlayerState
    setSelectedCard: (player: PlayerState) => void
}> = ({
    children,
    currentPosition,
    isSelected,
    selectable,
    selectedCard,
    setSelectedCard,
}) => {
    const isHighlighted = !!selectable && isSelected === selectedCard
    const isCurrentPlayer = currentPosition === selectedCard.position
    const disabled =
        !!selectable &&
        selectable.disabledForPositions.includes(selectedCard.position)
    return (
        <Box
            style={{
                userSelect: disabled ? 'none' : 'inherit',
                pointerEvents: disabled ? 'none' : 'inherit',
            }}
            onClick={
                selectable && !disabled
                    ? () => setSelectedCard(selectedCard)
                    : undefined
            }
        >
            <CardBorder
                border={getBorderType(isCurrentPlayer, isHighlighted, disabled)}
                selectable={!!selectable}
            >
                {children}
            </CardBorder>
        </Box>
    )
}

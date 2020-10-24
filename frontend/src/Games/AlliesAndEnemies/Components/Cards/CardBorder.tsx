import React from 'react'
import { BorderType } from 'grommet/utils'
import { Box } from 'grommet'

const defaultStyle: Partial<BorderType> = {
    style: 'dashed',
    size: 'medium',
}
const WrapperBorderTypeRecord: Record<WrapperBorderType, BorderType> = {
    current: { ...defaultStyle, color: 'light-4' },
    disabled: {
        ...defaultStyle,
        color: 'dark-3',
        style: 'dashed',
    },
    highlighted: { ...defaultStyle, color: 'orange' },
    none: { ...defaultStyle, color: 'rgba(0,0,0,0)' },
}
export type WrapperBorderType = 'none' | 'current' | 'highlighted' | 'disabled'
export const CardBorder: React.FC<{
    border?: WrapperBorderType
    selectable?: boolean
}> = ({ border = 'none', children, selectable = false }) => (
    <Box
        border={WrapperBorderTypeRecord[border]}
        pad="6px"
        margin={selectable ? '4px' : 'none'}
        round="small"
        style={{ pointerEvents: 'none' }}
    >
        {children}
    </Box>
)

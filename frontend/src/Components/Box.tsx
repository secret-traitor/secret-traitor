import { Box as BoxBase, BoxProps } from 'grommet'
import React from 'react'

const Box: React.FC<BoxProps> = ({ children, ...props }) => (
    <BoxBase
        border={{ color: 'brand-1', size: 'small' }}
        height={{ min: 'small', max: 'large' }}
        justify="start"
        overflow="scroll"
        pad="medium"
        round="medium"
        wrap
        {...props}
    >
        {children}
    </BoxBase>
)

export default Box

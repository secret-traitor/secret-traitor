import { Box as BoxBase, BoxProps } from 'grommet'
import React from 'react'

const Box: React.FC<BoxProps> = ({ children, ...props }) => (
    <BoxBase
        border={{ color: 'brand-1', size: 'small' }}
        pad="medium"
        justify="start"
        round="medium"
        overflow="scroll"
        height={{ min: 'small', max: 'large' }}
        {...props}
    >
        {children}
    </BoxBase>
)

export default Box

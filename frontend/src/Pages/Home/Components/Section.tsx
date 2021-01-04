import React from 'react'
import { BoxProps } from 'grommet/es6'
import { Box } from 'grommet'

export const Section: React.FC<BoxProps> = ({ children, ...props }) => (
    <Box
        align="center"
        background={{ color: 'light-1', opacity: 0.4 }}
        border={{ color: 'dark-6', style: 'dashed' }}
        direction="row"
        gap="large"
        justify="center"
        pad={{ vertical: 'large', horizontal: 'xlarge' }}
        round="medium"
        width="large"
        {...props}
    >
        {children}
    </Box>
)

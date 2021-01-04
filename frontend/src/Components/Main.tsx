import React from 'react'

import { Main, BoxProps } from 'grommet'

const Component: React.FC<BoxProps> = ({ children, ...props }) => (
    <Main
        align="center"
        background={{
            color: `brand-8`,
            opacity: 'medium',
        }}
        fill
        gap="large"
        pad="xlarge"
        {...props}
    >
        {children}
    </Main>
)

export default Component

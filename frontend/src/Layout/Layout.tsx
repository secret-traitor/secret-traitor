import React from 'react'
import { Box } from 'grommet'

import PageBody from 'Layout/PageBody'

const Layout: React.FC = () => (
    <Box
        overflow="hidden"
        background={{
            color: `brand-8`,
            opacity: 'medium',
        }}
        fill
    >
        <PageBody />
    </Box>
)
export default Layout

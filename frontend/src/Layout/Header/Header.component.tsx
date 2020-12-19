import React from 'react'
import { Box, Heading } from 'grommet'
import { Home } from 'grommet-icons'

import { HomeRouterButton } from 'links'

type HeaderProps = {
    size: string
}

const Header: React.FC<HeaderProps> = () => (
    <Box
        align="center"
        background="brand-2"
        direction="row"
        elevation="medium"
        justify="between"
        pad={{ left: 'medium', right: 'small', vertical: 'xsmall' }}
        style={{ zIndex: 1 }}
        tag="header"
    >
        <Heading level="3" margin="none">
            <HomeRouterButton
                focusIndicator={false}
                icon={<Home />}
                hoverIndicator
            />
        </Heading>
    </Box>
)

export default Header

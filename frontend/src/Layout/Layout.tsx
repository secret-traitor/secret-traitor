import React from 'react'
import { Grommet } from 'grommet'
import { HashRouter } from 'react-router-dom'

import PageBody from 'Layout/PageBody'
import theme from 'theme'

const Layout: React.FC = () => (
    <Grommet theme={theme} full>
        <HashRouter>
            <PageBody />
        </HashRouter>
    </Grommet>
)
export default Layout

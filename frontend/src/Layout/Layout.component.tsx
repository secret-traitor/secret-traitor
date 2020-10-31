import React from 'react'
import { Grommet, ResponsiveContext } from 'grommet'
import { ModalProvider } from 'styled-react-modal'
import { HashRouter as Router } from 'react-router-dom'

import Header from 'Layout/Header'
import PageBody from 'Layout/PageBody'
import theme from 'theme'

const Layout: React.FC = () => (
    <>
        <Grommet theme={theme} full>
            <ModalProvider>
                <ResponsiveContext.Consumer>
                    {(size) => (
                        <Router>
                            <Header size={size} />
                            <PageBody size={size} />
                        </Router>
                    )}
                </ResponsiveContext.Consumer>
            </ModalProvider>
        </Grommet>
    </>
)
export default Layout

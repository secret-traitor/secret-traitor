import React from 'react'
import Layout from 'Layout'
import { ApolloProvider } from '@apollo/react-hooks'

import client from './ApolloClient'
import { Grommet } from 'grommet'
import theme from './theme'
import { HashRouter } from 'react-router-dom'

const App = () => (
    <ApolloProvider client={client}>
        <Grommet theme={theme} full>
            <HashRouter>
                <Layout />
            </HashRouter>
        </Grommet>
    </ApolloProvider>
)

export default App

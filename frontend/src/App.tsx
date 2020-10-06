import React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { HashRouter as Router } from 'react-router-dom'

import ApolloClient from 'ApolloClient'
import Layout from 'Layout'

const App = () => {
    return (
        <ApolloProvider client={ApolloClient}>
            <Router>
                <Layout />
            </Router>
        </ApolloProvider>
    )
}

export default App

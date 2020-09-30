import React from 'react'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'
import { HashRouter as Router } from 'react-router-dom'

import Layout from 'Layout'

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
})

const App = () => {
    return (
        <ApolloProvider client={client}>
            <Router>
                <Layout />
            </Router>
        </ApolloProvider>
    )
}

export default App

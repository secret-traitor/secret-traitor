import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { enableExperimentalFragmentVariables } from 'graphql-tag'

import * as serviceWorker from './serviceWorker'
import { bootstrapClient } from './ApolloClient'
import App from './App'
;(async () => {
    enableExperimentalFragmentVariables()
    const ApolloClient = await bootstrapClient()
    ReactDOM.render(
        <React.StrictMode>
            <ApolloProvider client={ApolloClient}>
                <App />
            </ApolloProvider>
        </React.StrictMode>,
        document.getElementById('root')
    )
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister()
})()

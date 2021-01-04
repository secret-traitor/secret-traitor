import React from 'react'
import { ApolloError } from 'apollo-boost'
import { Text } from 'grommet'

import DelayedRedirect from 'Components/DelayedRedirect'
import Loader from 'Components/Loader'
import Main from 'Components/Main'
import Popup from 'Components/Popup'
import { getErrorUrl } from 'Links'

const ErrorPage: React.FC<{ error: ApolloError }> = ({ error }) => {
    console.log(error?.networkError)
    console.log(error?.message)
    console.log(error?.graphQLErrors)
    let type
    if (error?.networkError) {
        type = 'network'
    }
    return (
        <Main>
            <DelayedRedirect to={getErrorUrl(type)} delay={6000} />
            <Popup position="top" align="center">
                <Text size="large" weight="bold">
                    Uh Oh!
                </Text>
                <Text>
                    We are having trouble connecting to the game server.
                </Text>
                <Loader />
                <Text>Trying to reconnect...</Text>
            </Popup>
        </Main>
    )
}

export default ErrorPage

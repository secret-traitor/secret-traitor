import { getMainDefinition } from 'apollo-utilities'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloClient } from 'apollo-client'
import { HttpLink, InMemoryCache, split } from 'apollo-boost'
import { Operation } from 'apollo-link/lib/types'
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'

import introspectionQueryResultData from './fragmentTypes.json'

export const bootstrapApolloClient = (allowLocal?: boolean) => {
    let href = window.location.href
    if (allowLocal && process.env.NODE_ENV === 'development') {
        href = 'http://localhost:4000/'
    }
    const httpUrl = new URL('/graphql', href)
    const wsUrl = new URL(httpUrl.href)
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:'

    const getLink = () =>
        split(
            ({ query }: Operation) => {
                const def = getMainDefinition(query)
                return (
                    def.kind === 'OperationDefinition' &&
                    def.operation === 'subscription'
                )
            },
            new WebSocketLink({
                uri: wsUrl.href,
                options: { reconnect: true },
            }),
            new HttpLink({ uri: httpUrl.href })
        )

    return new ApolloClient({
        link: getLink(),
        cache: new InMemoryCache({
            fragmentMatcher: new IntrospectionFragmentMatcher({
                introspectionQueryResultData,
            }),
        }),
    })
}

const client = bootstrapApolloClient()

export default client

import { getMainDefinition } from 'apollo-utilities'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloClient } from 'apollo-client'
import { split, HttpLink, InMemoryCache } from 'apollo-boost'
import { Operation } from 'apollo-link/lib/types'
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'

import introspectionQueryResultData from './fragmentTypes.json'

let href = window.location.href
// if (process.env.NODE_ENV === 'development') {
//     href = 'http://localhost:4000/'
// }
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

export const bootstrapClient = async () =>
    new ApolloClient({
        link: getLink(),
        cache: new InMemoryCache({
            fragmentMatcher: new IntrospectionFragmentMatcher({
                introspectionQueryResultData,
            }),
        }),
    })

import { getMainDefinition } from 'apollo-utilities'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloClient } from 'apollo-client'
import { split, HttpLink, InMemoryCache } from 'apollo-boost'
import { Operation } from 'apollo-link/lib/types'
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'

import introspectionQueryResultData from './fragmentTypes.json'

import { backendHttpUrl, backendWsUrl } from './env'

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
            uri: backendWsUrl,
            options: { reconnect: true },
        }),
        new HttpLink({ uri: backendHttpUrl })
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

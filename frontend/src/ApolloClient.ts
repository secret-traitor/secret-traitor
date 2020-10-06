import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'

const wsurl = 'ws://localhost:4000/graphql'
const httpurl = 'http://localhost:4000/graphql'

const wsLink = new WebSocketLink({
    uri: wsurl,
    options: {
        reconnect: true,
    },
})

const httpLink = new HttpLink({
    uri: httpurl,
})

const link = split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    httpLink
)

const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    name: 'backend',
})

export default client

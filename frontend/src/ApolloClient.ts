import { getMainDefinition } from 'apollo-utilities'
import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
    split,
} from '@apollo/react-hooks'
import { WebSocketLink } from 'apollo-link-ws'

const WS_URL = 'ws://localhost:4000/graphql'
const HTTP_URL = 'http://localhost:4000/graphql'

const getLink = () =>
    split(
        ({ query }) => {
            const def = getMainDefinition(query)
            return (
                def.kind === 'OperationDefinition' &&
                def.operation === 'subscription'
            )
        },
        new WebSocketLink({ uri: WS_URL, options: { reconnect: true } }),
        new HttpLink({ uri: HTTP_URL })
    )

export const bootstrapClient = async () =>
    new ApolloClient({
        link: getLink(),
        cache: new InMemoryCache(),
    })

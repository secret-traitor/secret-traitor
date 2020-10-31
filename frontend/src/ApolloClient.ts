import { getMainDefinition } from 'apollo-utilities'
import { WebSocketLink } from 'apollo-link-ws'

import {ApolloClient} from "apollo-client";
import {split, HttpLink, InMemoryCache} from "apollo-boost"
import { Operation } from 'apollo-link/lib/types'

const WS_URL = 'ws://localhost:4000/graphql'
const HTTP_URL = 'http://localhost:4000/graphql'

const getLink = () =>
    split(
        ({ query }: Operation) => {
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

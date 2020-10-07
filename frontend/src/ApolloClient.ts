import fs from 'fs'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-boost'
import { gql } from 'apollo-boost'

const wsurl = 'ws://localhost:4000/graphql'
const httpurl = 'http://localhost:4000/graphql'

function getLink() {
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
    return link
}

function getCache() {
    const possibleTypes: { [typeName: string]: any } = {}

    fetch(httpurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            variables: {},
            query: gql`
                {
                    __schema {
                        types {
                            kind
                            name
                            possibleTypes {
                                name
                            }
                        }
                    }
                }
            `,
        }),
    })
        .then((result: any) => result.json())
        .then((result: any) => {
            result.data.__schema.types.forEach((supertype: any) => {
                if (supertype.possibleTypes) {
                    possibleTypes[supertype.name] = supertype.possibleTypes.map(
                        (subtype: any) => subtype.name
                    )
                }
            })

            console.log('writing possible types')
            fs.writeFile(
                'possibleTypes.json',
                JSON.stringify(possibleTypes),
                (err: any) => {
                    if (err) {
                        console.error('Error writing possibleTypes.json', err)
                    } else {
                        console.log('Fragment types successfully getLink!')
                    }
                }
            )
        })

    const cache = new InMemoryCache({})
    return cache
}

const bootstrapClient = () => {
    const cache = getCache()
    const link = getLink()

    return new ApolloClient({ link, cache })
}

export default bootstrapClient()

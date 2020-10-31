import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { createServer } from 'http'

import plugins from './plugins'
import schema from './schema'

const app = express()
const server = createServer(app)
const apollo = new ApolloServer({ schema, plugins })
apollo.applyMiddleware({ app, path: '/graphql' })
apollo.applyMiddleware({ app, cors: { credentials: false, origin: false } })
apollo.installSubscriptionHandlers(server)
export default server

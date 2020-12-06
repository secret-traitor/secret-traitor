import express from 'express'
import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { createServer } from 'http'

import plugins from './plugins'
import schema from './schema'
import { buildDataSources } from './buildDataSources'

const app = express()
const server = app
// const server = createServer(app)
// const apollo = new ApolloServer({
//     schema,
//     plugins,
//     dataSources: buildDataSources,
//     context: async ({ req, connection }) => {
//         let context = {
//             request: req,
//             headers: req?.headers,
//         }
//         if (connection) {
//             context = {
//                 ...context,
//                 ...connection.context,
//                 dataSources: buildDataSources(),
//             }
//         }
//         return context
//     },
// })
// apollo.applyMiddleware({ app, path: '/graphql' })
// apollo.applyMiddleware({ app, cors: { credentials: false, origin: false } })
// apollo.installSubscriptionHandlers(server)
app.get('/canary', (req, res) => {
    return res.send({ canary: 'this app is running' })
})
export default server

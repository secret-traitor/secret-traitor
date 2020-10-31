import './LoadEnv' // Must be the first import
import 'reflect-metadata'
import server from '@server'
import logger from '@shared/Logger'

const port = Number(process.env.PORT || 3000)

server.listen({ port }, () => {
    logger.info(`Apollo Server on http://localhost:${port}/graphql`)
})

// let id = 2
//
// setInterval(() => {
//     pubsub.publish('MESSAGE_CREATED', {
//         messageCreated: { id, content: new Date().toString() },
//     })
//
//     id++
// }, 1000)

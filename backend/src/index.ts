import './LoadEnv' // Must be the first import
import 'reflect-metadata'
import server from 'src/server'
import logger from 'src/shared/Logger'

import { waitForTable } from 'src/clients/Games'

const port = Number(process.env.PORT || 3000)

waitForTable().then(() => {
    logger.info('DynamoDB is ready')
    server.listen({ port }, () => {
        logger.info(`Apollo Server on http://localhost:${port}/graphql`)
    })
})

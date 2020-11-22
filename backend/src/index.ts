import './LoadEnv' // Must be the first import
import 'reflect-metadata'
import server from '@server'
import logger from '@shared/Logger'

import { waitForTable } from '@clients/dynamo'

const port = Number(process.env.PORT || 3000)

waitForTable('Games').then(() => {
    logger.info('DynamoDB is ready')
    server.listen({ port }, () => {
        logger.info(`Apollo Server on http://localhost:${port}/graphql`)
    })
})

import './LoadEnv' // Must be the first import
import 'reflect-metadata'
import server from 'src/server'
import logger from 'src/shared/Logger'
import * as env from 'src/shared/config'

import { waitForTable } from 'src/clients/dynamoDb'

const waitForTables = async () => {
    const waitingFor = []
    waitingFor.push(waitForTable(env.GAMES_TABLE_NAME))
    // if (env.NODE_ENV === 'production') {
    //     waitingFor.push(waitForTable(env.CONNECTIONS_TABLE_NAME))
    //     waitingFor.push(waitForTable(env.SUBSCRIPTIONS_OPERATIONS_TABLE_NAME))
    //     waitingFor.push(waitForTable(env.SUBSCRIPTIONS_TABLE_NAME))
    // }
    await Promise.all(waitingFor)
    logger.info('DynamoDB resources are ready')
}

const bootstrap = async () => {
    await waitForTables()
}

bootstrap().then(() => {
    server.listen({ port: env.PORT }, () => {
        logger.info(`Server is ready`)
    })
})

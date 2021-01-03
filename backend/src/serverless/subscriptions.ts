import { DynamoDBSubscriptionManager, ServerConfig } from 'aws-lambda-graphql'

import dynamoDbClient from 'src/clients/dynamoDb'
import * as env from 'src/shared/config'
import logger from 'src/shared/Logger'

export const subscriptionManager = new DynamoDBSubscriptionManager({
    dynamoDbClient,
    subscriptionOperationsTableName: env.SUBSCRIPTIONS_OPERATIONS_TABLE_NAME,
    subscriptionsTableName: env.SUBSCRIPTIONS_TABLE_NAME,
    ttl: env.SUBSCRIPTION_TTL,
})
export const subscriptionServerOptions: ServerConfig<
    any,
    any
>['subscriptions'] = {
    onOperation: (message, params, connection) => {
        logger.debug('==== onOperation ====')

        logger.debug('message:')
        logger.debug(message)
        logger.debug('\n')

        logger.debug('params:')
        logger.debug(params)
        logger.debug('\n')

        logger.debug('connection:')
        logger.debug(connection)
        logger.debug('\n')

        return params
    },

    onOperationComplete: (connection, operationId) => {
        logger.debug('==== onOperationComplete ====')

        logger.debug('connection:')
        logger.debug(connection)
        logger.debug('\n')

        logger.debug('operationId:')
        logger.debug(operationId)
        logger.debug('\n')
    },

    onConnect: (messagePayload, connection, event, context) => {
        logger.debug('==== onConnect ====')

        logger.debug('messagePayload:')
        logger.debug(messagePayload)
        logger.debug('\n')

        logger.debug('connection:')
        logger.debug(connection)
        logger.debug('\n')

        logger.debug('event:')
        logger.debug(event)
        logger.debug('\n')

        logger.debug('context:')
        logger.debug(context)
        logger.debug('\n')

        return context
    },

    onDisconnect: (connection) => {
        logger.debug('==== onDisconnect ====')

        logger.debug('connection:')
        logger.debug(connection)
        logger.debug('\n')
    },

    onWebsocketConnect: (connection, event, context) => {
        logger.debug('==== onWebsocketConnect ====')

        logger.debug('connection:')
        logger.debug(connection)
        logger.debug('\n')

        logger.debug('event:')
        logger.debug(event)
        logger.debug('\n')

        logger.debug('context:')
        logger.debug(context)
        logger.debug('\n')

        return context
    },
}

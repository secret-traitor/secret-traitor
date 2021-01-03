import { DynamoDBConnectionManager } from 'aws-lambda-graphql'

import dynamoDbClient from 'src/clients/dynamoDb'
import * as env from 'src/shared/config'

import { subscriptionManager } from './subscriptions'

export const connectionManager = new DynamoDBConnectionManager({
    dynamoDbClient,
    connectionsTable: env.CONNECTIONS_TABLE_NAME,
    subscriptions: subscriptionManager,
    debug: env.DEBUG,
    ttl: env.CONNECTION_TTL,
})

import {
    DynamoDBConnectionManager,
    DynamoDBEventProcessor,
    DynamoDBSubscriptionManager,
    Server as LambdaGraphQLServer,
} from 'aws-lambda-graphql'

import dynamoDbClient from 'src/clients/dynamoDb'
import config from 'src/server/config'

const debug = Boolean(process.env.DEBUG)

const subscriptionManager = new DynamoDBSubscriptionManager({ dynamoDbClient })
const connectionManager = new DynamoDBConnectionManager({
    dynamoDbClient,
    subscriptions: subscriptionManager,
    debug,
})
const eventProcessor = new DynamoDBEventProcessor({
    debug,
})
const server = new LambdaGraphQLServer({
    ...config,
    connectionManager,
    eventProcessor,
    subscriptionManager,
})
export const httpHandler = server.createHttpHandler()
export const webSocketHandler = server.createWebSocketHandler()
export const eventHandler = server.createEventHandler()

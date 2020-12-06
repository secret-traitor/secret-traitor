import {
    DynamoDBConnectionManager,
    DynamoDBEventProcessor,
    DynamoDBSubscriptionManager,
    Server,
} from 'aws-lambda-graphql'

import dynamoDbClient from 'src/clients/dynamoDb'

import config from './server/config'

const subscriptionManager = new DynamoDBSubscriptionManager({ dynamoDbClient })
const connectionManager = new DynamoDBConnectionManager({
    dynamoDbClient,
    subscriptions: subscriptionManager,
})
const server = new Server({
    ...config,
    connectionManager,
    eventProcessor: new DynamoDBEventProcessor(),
    subscriptionManager,
})
server.setGraphQLPath('/graphql')
export const handleHttp = server.createHttpHandler()
export const handleWebSocket = server.createWebSocketHandler()

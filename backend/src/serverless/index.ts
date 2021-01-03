import { Server as LambdaGraphQLServer } from 'aws-lambda-graphql'

import config from 'src/server/config'

import { connectionManager } from './connections'
import { eventProcessor } from './events'
import { subscriptionManager, subscriptionServerOptions } from './subscriptions'

const server = new LambdaGraphQLServer({
    ...config,
    connectionManager,
    eventProcessor,
    subscriptionManager,
    subscriptions: subscriptionServerOptions,
})

export const httpHandler = server.createHttpHandler()
export const webSocketHandler = server.createWebSocketHandler()
export const eventHandler = server.createEventHandler()

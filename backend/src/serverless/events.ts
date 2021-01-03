import { DynamoDBEventProcessor } from 'aws-lambda-graphql'

import * as env from 'src/shared/config'
import logger from 'src/shared/Logger'

const eventErrorHandler = (err: any) => {
    logger.error(err)
}

export const eventProcessor = new DynamoDBEventProcessor({
    onError: eventErrorHandler,
    debug: env.DEBUG,
})

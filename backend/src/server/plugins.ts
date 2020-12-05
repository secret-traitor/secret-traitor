import { PluginDefinition } from 'apollo-server-core/src/types'

import logger from 'src/shared/Logger'

export const LoggingPlugin: PluginDefinition = {
    requestDidStart(requestContext) {
        const start = new Date().getTime()
        return {
            willSendResponse(requestContext) {
                const operation = requestContext.request.operationName
                if (operation !== 'IntrospectionQuery') {
                    const duration = new Date().getTime() - start
                    logger.debug(
                        `Send Response: "${operation}" (${duration}ms)`
                    )
                }
            },
            didEncounterErrors(requestContext) {
                logger.error(JSON.stringify(requestContext.errors))
                logger.debug(
                    JSON.stringify(
                        requestContext.errors.flatMap((e) => e.stack)
                    )
                )
            },
        }
    },
}

export default [LoggingPlugin]

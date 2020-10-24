import { PluginDefinition } from 'apollo-server-core/src/types'

import logger from '@shared/Logger'

export const LoggingPlugin: PluginDefinition = {
    serverWillStart() {
        // logger.debug('LoggingPlugin initialized')
    },
    requestDidStart(requestContext) {
        const start = new Date().getTime()
        // logger.debug(
        //     'Received Query:\n' +
        //         JSON.stringify(requestContext.request.query) +
        //         '\nWith variables:\n' +
        //         JSON.stringify(requestContext.request.variables)
        // )
        return {
            willSendResponse(requestContext) {
                logger.debug(`Request took: ${new Date().getTime() - start}ms`)
                // logger.debug(
                //     'Sending ApiResponse:\n' +
                //         JSON.stringify(requestContext.response.data)
                // )
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

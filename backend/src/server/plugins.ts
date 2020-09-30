import { PluginDefinition } from 'apollo-server-core/src/types'

import logger from '@shared/Logger'

export const LoggingPlugin: PluginDefinition = {
    serverWillStart() {
        logger.debug('LoggingPlugin initialized')
    },
    requestDidStart(requestContext) {
        logger.debug(
            'Received Query:\n' +
                JSON.stringify(requestContext.request.query) +
                '\nWith variables:\n' +
                JSON.stringify(requestContext.request.variables)
        )
        return {
            willSendResponse(requestContext) {
                logger.debug(
                    'Sending Response:\n' +
                        JSON.stringify(requestContext.response.data)
                )
            },
            didEncounterErrors(requestContext) {
                logger.error(JSON.stringify(requestContext.errors))
            },
        }
    },
}

export default [LoggingPlugin]

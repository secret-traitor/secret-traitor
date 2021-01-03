/**
 * Setup the winston logger.
 *
 * Documentation: https://github.com/winstonjs/winston
 */

import { createLogger, format, transports } from 'winston'

import * as env from 'src/shared/config'

// Import Functions
const { Console } = transports

// Init Logger
const logger = createLogger({
    level: env.LOG_LEVEL,
})

const errorStackFormat = format((info) => {
    if (info.stack) {
        // tslint:disable-next-line:no-console
        console.log(info.stack)
        return false
    }
    return info
})
const consoleTransport = new Console({
    format: format.combine(
        format.colorize(),
        format.simple(),
        errorStackFormat()
    ),
})
logger.add(consoleTransport)

export default logger

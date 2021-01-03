import { ContextFunction } from 'apollo-server-core'
import dataSources from './dataSources'

const getSubscriptionContext: ContextFunction = ({ req, connection }) => ({
    request: req,
    headers: req?.headers,
    // TODO: manually call `initialize` on subscription data sources
    dataSources: dataSources(),
    ...connection.context,
})

// TODO: get some better typing on this
const context: ContextFunction = ({ req, connection }) =>
    connection
        ? getSubscriptionContext({ req, connection })
        : { request: req, headers: req?.headers }

export default context

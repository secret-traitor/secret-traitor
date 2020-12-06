import { Context, ContextFunction } from 'apollo-server-core'
import { ExpressContext } from 'apollo-server-express/src/ApolloServer'

import buildDataSources from './buildDataSources'
import plugins from './plugins'
import schema from './schema'

const context: ContextFunction<ExpressContext, Context> = ({
    req,
    connection,
}) =>
    connection
        ? {
              request: req,
              headers: req?.headers,
              dataSources: buildDataSources(),
              ...connection.context,
          }
        : { request: req, headers: req?.headers }

const config = {
    context,
    dataSources: buildDataSources,
    plugins,
    schema,
}
export default config

import { ContextFunction } from 'apollo-server-core'

import dataSources from './buildDataSources'
import plugins from './plugins'
import schema from './schema'

const context: ContextFunction = ({ req, connection }) =>
    connection
        ? {
              request: req,
              headers: req?.headers,
              dataSources: dataSources(),
              ...connection.context,
          }
        : { request: req, headers: req?.headers }

const config = {
    context,
    dataSources,
    playground: true,
    plugins,
    schema,
}
export default config

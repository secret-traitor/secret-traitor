import { Config as ApolloConfig } from 'apollo-server-core'

import dataSources from './dataSources'
import plugins from './plugins'
import schema from './schema'
import context from './context'

const config: ApolloConfig = {
    context,
    dataSources,
    introspection: true,
    playground: true,
    plugins,
    schema,
}
export default config

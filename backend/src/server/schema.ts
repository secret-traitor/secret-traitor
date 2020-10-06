import { buildSchemaSync } from 'type-graphql'
import container from './container'

const schema = buildSchemaSync({
    resolvers: ['src/**/resolvers.{ts,js}', 'src/graphql/**/*.{ts,js}'],
    container,
})

export default schema

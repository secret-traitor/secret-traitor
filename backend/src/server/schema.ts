import { buildSchemaSync } from 'type-graphql'

const schema = buildSchemaSync({
    resolvers: ['src/**/resolvers.{ts,js}', 'src/graphql/**/*.{ts,js}'],
})

export default schema

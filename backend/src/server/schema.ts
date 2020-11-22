import { buildSchemaSync } from 'type-graphql'

const schema = buildSchemaSync({
    resolvers: ['src/graphql/**/*.{ts,js}'],
})

export default schema

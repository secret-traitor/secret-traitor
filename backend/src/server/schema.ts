import { buildSchemaSync } from 'type-graphql'

import { GameResolver } from '@entities/Game'
import { GamePlayerResolver } from '@entities/GamePlayer/resolver'

const schema = buildSchemaSync({
    resolvers: [GameResolver, GamePlayerResolver],
    emitSchemaFile: true,
})

export default schema

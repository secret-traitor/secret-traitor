import { buildSchemaSync } from 'type-graphql'

import { AlliesAndEnemiesStateResolver } from '@entities/AlliesAndEnemies/resolvers'
import { GamePlayerResolver } from '@entities/GamePlayer'
import { GamePlayerStateResolver } from '@entities/PlayerGameState'
import { GameResolver } from '@entities/Game'
import { GameStateResolver } from '@entities/GameState/resolvers'
import { NotificationResolver } from '@entities/Notifications'

const schema = buildSchemaSync({
    resolvers: [
        AlliesAndEnemiesStateResolver,
        GamePlayerResolver,
        GamePlayerStateResolver,
        GameResolver,
        GameStateResolver,
    ],
    emitSchemaFile: true,
})

export default schema

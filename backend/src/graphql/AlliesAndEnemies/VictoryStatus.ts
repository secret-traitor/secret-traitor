import { Field, ObjectType, registerEnumType } from 'type-graphql'

import { Faction, VictoryType } from '@games/AlliesAndEnemies'
import { Victory } from '@games/AlliesAndEnemies/AlliesAndEnemies.types'

@ObjectType()
export class AlliesAndEnemiesVictoryStatus implements Victory {
    @Field(() => String)
    message: string

    @Field(() => Faction)
    team: Faction

    @Field(() => VictoryType)
    type: VictoryType
}

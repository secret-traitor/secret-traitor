import { Field, ObjectType } from 'type-graphql'

import { Faction, VictoryType, Victory } from '@entities/AlliesAndEnemies'

@ObjectType()
export class AlliesAndEnemiesVictoryStatus implements Victory {
    @Field(() => String)
    message: string

    @Field(() => Faction)
    team: Faction

    @Field(() => VictoryType)
    type: VictoryType
}

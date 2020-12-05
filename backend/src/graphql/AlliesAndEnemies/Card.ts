import { Field, ObjectType } from 'type-graphql'

import { Faction } from 'src/entities/AlliesAndEnemies'
import { Card as ICard } from 'src/entities/AlliesAndEnemies'

@ObjectType()
export class Card implements ICard {
    @Field(() => Faction)
    suit: Faction
}

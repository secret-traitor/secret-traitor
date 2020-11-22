import { Field, ObjectType } from 'type-graphql'

import { Faction } from '@entities/AlliesAndEnemies'
import { Card as ICard } from '@entities/AlliesAndEnemies'

@ObjectType()
export class Card implements ICard {
    @Field(() => Faction)
    suit: Faction
}

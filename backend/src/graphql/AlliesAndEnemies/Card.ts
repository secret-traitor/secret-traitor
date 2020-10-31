import { Field, ObjectType } from 'type-graphql'

import { Faction } from '@games/AlliesAndEnemies'
import { Card as ICard } from '@games/AlliesAndEnemies'

@ObjectType()
export class Card implements ICard {
    @Field(() => Faction)
    suit: Faction
}

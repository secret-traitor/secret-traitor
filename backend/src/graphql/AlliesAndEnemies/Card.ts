import { Field, ObjectType } from 'type-graphql'

import { CardSuit } from '@games/AlliesAndEnemies'
import { Card as ICard } from '@games/AlliesAndEnemies'

@ObjectType()
export class Card implements ICard {
    @Field(() => CardSuit)
    suit: CardSuit
}

import { Field, ObjectType } from 'type-graphql'

import { BoardAction, Card as ICard } from '@games/AlliesAndEnemies'

import { Card } from './Card'

@ObjectType()
export class BoardRow {
    @Field(() => [Card])
    cards: ICard[]

    @Field(() => Number)
    maxCards: number
}

@ObjectType()
export class BoardState {
    @Field(() => [BoardAction])
    readonly actions: BoardAction[]

    @Field(() => BoardRow)
    readonly ally: BoardRow

    @Field(() => BoardRow)
    readonly enemy: BoardRow
}

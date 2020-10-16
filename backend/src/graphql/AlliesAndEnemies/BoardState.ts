import { Field, ObjectType } from 'type-graphql'

import {
    BoardActionType,
    BoardState as IBoardState,
    BoardRow as IBoardRow,
    Card as ICard,
} from '@games/AlliesAndEnemies'

import { Card } from './Card'

@ObjectType()
export class BoardState implements IBoardState {
    @Field(() => [BoardActionType])
    readonly actions: BoardActionType[]

    @Field(() => BoardRow)
    readonly ally: IBoardRow

    @Field(() => BoardRow)
    readonly enemy: IBoardRow
}

@ObjectType()
export class BoardRow implements IBoardRow {
    @Field(() => [Card])
    cards: ICard[]

    @Field(() => Number)
    maxCards: number
}

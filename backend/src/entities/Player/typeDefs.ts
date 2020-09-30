import { Field, ObjectType } from 'type-graphql'

import { IPlayer } from './model'

@ObjectType({ description: 'Player details' })
export class Player implements IPlayer {
    @Field(() => String)
    public code: string

    @Field(() => String, { nullable: true })
    public nickname: string
}

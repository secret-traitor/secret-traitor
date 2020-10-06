import { Field, ID, ObjectType } from 'type-graphql'

import { IPlayer, PlayerId } from '@entities/Player'

@ObjectType({ description: 'Player details' })
export class Player implements IPlayer {
    @Field(() => ID)
    public id: PlayerId

    @Field(() => String)
    public code: string

    @Field(() => String, { nullable: true })
    public nickname: string
}

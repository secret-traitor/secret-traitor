import { Field, ID, ObjectType } from 'type-graphql'

import { IPlayer, PlayerId } from '@entities/Player'

@ObjectType({ description: 'Player details' })
export class Player implements IPlayer {
    @Field(() => ID)
    public readonly id: PlayerId

    @Field(() => String, { nullable: true })
    public readonly nickname?: string

    @Field(() => Boolean, { defaultValue: false, nullable: true })
    public readonly host?: boolean
}

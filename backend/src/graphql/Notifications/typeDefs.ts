import { ArgsType, Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
export class Notification {
    @Field(() => ID)
    id: number

    @Field({ nullable: true })
    message?: string

    @Field(() => Date)
    date: Date
}

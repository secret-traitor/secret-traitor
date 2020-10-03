import { Field, ObjectType } from 'type-graphql'

import { IGamePlayer } from './model'

@ObjectType({
    description: 'Represents the relationship between a player and a game',
})
export class GamePlayer implements IGamePlayer {
    public gameId: string

    public host: boolean

    @Field()
    public id: string

    public playerCode: string

    public playerNickname?: string
}

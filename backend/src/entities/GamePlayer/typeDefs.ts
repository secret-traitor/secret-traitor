import { Field, ID, ObjectType } from 'type-graphql'

import Player, { IPlayer } from '@entities/Player'
import Game, { IGame } from '@entities/Game'

import { IGamePlayer } from './model'

@ObjectType({ description: 'The current state of a game' })
export class GamePlayer implements IGamePlayer {
    public id: string

    @Field(() => Game)
    public game: IGame

    @Field(() => ID)
    public gameId: string

    @Field(() => Boolean)
    public host: boolean

    @Field(() => Player)
    public player: IPlayer

    @Field(() => String)
    public playerCode: string
}

import { Field, ID, ObjectType } from 'type-graphql'

import Player, { IPlayer } from '@entities/Player'
import Game, { IGame } from '@entities/Game'

import { IGamePlayer } from './model'

@ObjectType({ description: 'The current state of a game' })
export class GamePlayer implements IGamePlayer {
    public gameId: string
    public host: boolean
    public id: string
    public playerCode: string
    public playerNickname?: string
}

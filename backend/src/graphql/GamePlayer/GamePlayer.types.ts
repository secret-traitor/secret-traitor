import { Field, ID, ObjectType } from 'type-graphql'

import { GameId } from '@entities/Game'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { PlayerId } from '@entities/Player'

@ObjectType({
    description: 'Represents the relationship between a player and a game',
})
export class GamePlayer implements IGamePlayer {
    @Field(() => ID)
    id: GamePlayerId

    gameId: GameId

    @Field(() => Boolean, { name: 'isHost' })
    host: boolean

    playerId: PlayerId
}

import { Field, InterfaceType, ID } from 'type-graphql'

import { Game, IGame } from '@entities/Game'
import { Player } from '@entities/Player'

@InterfaceType()
export abstract class GameState {
    @Field(() => ID, { name: 'id' })
    public gameId: string

    @Field(() => Game)
    public game: IGame

    @Field(() => [Player])
    public players: Player[]
}

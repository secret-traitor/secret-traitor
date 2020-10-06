import {
    Field,
    InterfaceType,
    ID,
    Subscription,
    Arg,
    ArgsType,
} from 'type-graphql'
import { Game } from '@graphql/Game'

@InterfaceType()
export abstract class GamePlayerState {
    @Field(() => ID, { name: 'id' })
    public gamePlayerId: string

    @Field(() => Game)
    public game: Game
}

@ArgsType()
export class GamePlayerStateSubArgs {
    @Field(() => ID)
    gameId: string
    @Field(() => ID)
    gamePlayerId: string
}

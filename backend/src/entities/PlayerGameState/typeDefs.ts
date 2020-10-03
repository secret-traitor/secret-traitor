import {
    Field,
    InterfaceType,
    ID,
    Subscription,
    Arg,
    ArgsType,
} from 'type-graphql'

import { Game, IGame } from '@entities/Game'

@InterfaceType()
export abstract class GamePlayerState {
    @Field(() => ID, { name: 'id' })
    public gamePlayerId: string

    @Field(() => Game)
    public game: IGame
}

@ArgsType()
export class GamePlayerStateSubArgs {
    @Field(() => ID)
    gameId: string
    @Field(() => ID)
    gamePlayerId: string
}

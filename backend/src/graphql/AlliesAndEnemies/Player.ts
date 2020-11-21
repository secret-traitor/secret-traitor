import { Field, ObjectType, registerEnumType } from 'type-graphql'

import { Player } from '@graphql/Player'
import {
    AlliesAndEnemiesState,
    BoardAction,
    PlayerRole,
    PlayerState,
    PlayerStatus,
    ViewingPlayerState,
} from '@games/AlliesAndEnemies'

@ObjectType()
export class AlliesAndEnemiesPlayer
    extends Player
    implements ViewingPlayerState {
    @Field(() => Number)
    readonly position: number

    @Field(() => PlayerRole)
    readonly role: PlayerRole

    @Field(() => PlayerStatus)
    readonly status: PlayerStatus
}

import { Field, ObjectType, registerEnumType } from 'type-graphql'

import { Player } from 'src/graphql/Player'
import {
    AlliesAndEnemiesState,
    BoardAction,
    PlayerRole,
    PlayerState,
    PlayerStatus,
    ViewingPlayerState,
} from 'src/entities/AlliesAndEnemies'

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

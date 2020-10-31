import { Field, ObjectType, registerEnumType } from 'type-graphql'

import { Player } from '@graphql/Player'
import {
    AlliesAndEnemiesState,
    BoardAction,
    PlayerRole,
    PlayerState,
    PlayerStatus,
} from '@games/AlliesAndEnemies'

@ObjectType()
export class AlliesAndEnemiesPlayer
    extends Player
    implements Omit<PlayerState, 'role'> {
    @Field(() => Number)
    position: number

    @Field(() => PlayerRole, { nullable: true })
    role?: PlayerRole

    @Field(() => PlayerStatus)
    status: PlayerStatus
}

import { Field, ObjectType } from 'type-graphql'

import { Player } from '@graphql/Player'
import { PlayerRole, PlayerState } from '@games/AlliesAndEnemies'

@ObjectType()
export class AlliesAndEnemiesPlayer
    extends Player
    implements Omit<PlayerState, 'role'> {
    @Field(() => Number)
    position: number

    @Field(() => PlayerRole, { nullable: true })
    role?: PlayerRole
}

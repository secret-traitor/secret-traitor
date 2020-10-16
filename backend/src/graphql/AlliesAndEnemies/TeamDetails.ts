import { Field, ID, ObjectType } from 'type-graphql'

import { IPlayer, PlayerId } from '@entities/Player'

import { PlayerRole } from '@games/AlliesAndEnemies'
import { Player } from '@graphql/Player'

@ObjectType()
export class TeamPlayer implements IPlayer {
    @Field(() => ID)
    public readonly id: PlayerId

    @Field(() => String)
    public readonly code: string

    @Field(() => String, { nullable: true })
    public readonly nickname: string

    @Field(() => PlayerRole)
    role: PlayerRole
}

@ObjectType()
export class TeamDetails {
    @Field(() => PlayerRole)
    readonly playerRole: PlayerRole

    @Field(() => [TeamPlayer], { nullable: true })
    readonly teammates: TeamPlayer[]
}

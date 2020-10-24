import { Field, ObjectType } from 'type-graphql'

import { AlliesAndEnemiesPlayer } from '@graphql/AlliesAndEnemies/Player'
import { TurnStatus } from '@games/AlliesAndEnemies'

@ObjectType()
export class CurrentTurn {
    @Field(() => Number)
    number: number

    @Field(() => AlliesAndEnemiesPlayer)
    currentPlayer: AlliesAndEnemiesPlayer

    @Field(() => Number)
    position: number

    @Field(() => AlliesAndEnemiesPlayer, { nullable: true })
    nominatedPlayer?: AlliesAndEnemiesPlayer

    @Field(() => TurnStatus)
    status: TurnStatus

    @Field(() => [AlliesAndEnemiesPlayer])
    ineligibleNominations: AlliesAndEnemiesPlayer[]
}

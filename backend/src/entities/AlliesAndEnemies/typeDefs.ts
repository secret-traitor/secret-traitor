import { ObjectType } from 'type-graphql'

import GameState from '@entities/GameState'
import PlayerGameState from '@entities/PlayerGameState'
import {
    IAlliesAndEnemiesState,
    IAlliesAndEnemiesPlayerState,
} from '@entities/AlliesAndEnemies'

@ObjectType({ implements: GameState })
export class AlliesAndEnemiesState
    extends GameState
    implements IAlliesAndEnemiesState {
    constructor(gameId: string) {
        super()
        this.gameId = gameId
    }
}

@ObjectType({ implements: PlayerGameState })
export class AlliesAndEnemiesPlayerState
    extends PlayerGameState
    implements IAlliesAndEnemiesPlayerState {
    constructor(gamePlayerId: string) {
        super()
        this.gamePlayerId = gamePlayerId
    }
}

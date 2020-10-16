import { GameType, IGame } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { GamePlayerId } from '@entities/GamePlayer'

import { AlliesAndEnemiesGameManager } from '@games/AlliesAndEnemies'

export type Start = { playerId: PlayerId } | { gamePlayerId: GamePlayerId }

export interface IGameManager {
    start: (
        args: { playerId: PlayerId } | { gamePlayerId: GamePlayerId }
    ) => Promise<boolean>
}

class GameManager implements IGameManager {
    private readonly internalManager: IGameManager

    constructor(game: IGame) {
        switch (game.type) {
            case GameType.AlliesNEnemies:
                this.internalManager = new AlliesAndEnemiesGameManager(game)
        }
    }

    async start(args: Start): Promise<boolean> {
        return await this.internalManager.start(args)
    }
}

export default GameManager

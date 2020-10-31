import { GameId, GameType, IGame } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import { GamePlayerId } from '@entities/GamePlayer'

import { AlliesAndEnemiesGameManager } from '@games/AlliesAndEnemies'

export type Start = { playerId: PlayerId } | { gamePlayerId: GamePlayerId }

export interface IGameManager {
    start: (
        args: { playerId: PlayerId } | { gamePlayerId: GamePlayerId }
    ) => Promise<boolean>

    exists: () => Promise<boolean>
}

class GameManager implements IGameManager {
    private readonly internalManager: IGameManager

    constructor(gameId: GameId, gameType: GameType) {
        switch (gameType) {
            case GameType.AlliesNEnemies:
                this.internalManager = new AlliesAndEnemiesGameManager(gameId)
        }
    }

    async start(args: Start): Promise<boolean> {
        return await this.internalManager.start(args)
    }

    async exists(): Promise<boolean> {
        return await this.internalManager.exists()
    }
}

export default GameManager

import { Inject } from 'typedi'
import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { DescriptiveError } from '@shared/api'
import { GameId } from '@entities/Game'
import { AlliesAndEnemiesState, PlayerState } from '@games/AlliesAndEnemies'
import { ActiveAlliesAndEnemiesState } from '@games/AlliesAndEnemies/AlliesAndEnemies.game'

export abstract class BaseAlliesAndEnemiesResolver {
    protected readonly gameStateDao: IAlliesAndEnemiesDao
    protected readonly gamePlayerDao: IGamePlayerDao
    protected readonly gameDao: IGameDao
    protected readonly playerDao: IPlayerDao

    protected async getGamePlayer(id: GamePlayerId): Promise<IGamePlayer> {
        const gamePlayer = await this.gamePlayerDao.get({ id })
        if (!gamePlayer) {
            throw new DescriptiveError(
                'Unable to look up player for this game.',
                'No game and player with this id found.'
            )
        }
        return gamePlayer
    }

    protected async getState(gameId: GameId): Promise<AlliesAndEnemiesState> {
        const state = await this.gameStateDao.get({ gameId })
        if (!state) {
            throw new DescriptiveError(
                'Unable to look up game state.',
                'No state data for this game found.'
            )
        }
        return state
    }

    protected async getViewingPlayerState(
        gamePlayerId: string
    ): Promise<{
        state: ActiveAlliesAndEnemiesState
        viewingPlayer: PlayerState
        gamePlayer: IGamePlayer
    }> {
        const gamePlayer = await this.getGamePlayer(gamePlayerId)
        const state = await this.getState(gamePlayer.gameId)
        const viewingPlayer =
            state.players.find((p) => p.id === gamePlayer.playerId) || null
        if (!state || !viewingPlayer) {
            throw new DescriptiveError(
                'Unable to lookup game state and active player.'
            )
        }
        return {
            state: new ActiveAlliesAndEnemiesState(state),
            viewingPlayer,
            gamePlayer,
        }
    }
}

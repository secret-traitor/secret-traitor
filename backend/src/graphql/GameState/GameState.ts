import { Inject, Service } from 'typedi'
import { FieldResolver, InterfaceType, Resolver, Root } from 'type-graphql'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { IGame, GameId, GameType } from '@entities/Game'
import { IGamePlayer, GamePlayerId } from '@entities/GamePlayer'
import { IPlayer, PlayerId } from '@entities/Player'

import { AlliesNEnemiesGameState } from '@graphql/AlliesAndEnemies'
import { Game } from '@graphql/Game'
import { Player } from '@graphql/Player'

import { ApiResponse, ApiError, UnexpectedApiError } from '@shared/api'

export interface IGameState {
    gamePlayerId: GamePlayerId
    gameType: GameType
}

@InterfaceType({
    resolveType: (args) => {
        switch (args.gameType) {
            case GameType.AlliesNEnemies:
                return AlliesNEnemiesGameState.name
            default:
                throw new ApiError(
                    'Unable to resolve game state type.',
                    `"${args.gameType}" is not a recognized game type.`
                )
        }
    },
})
export abstract class GameState implements IGameState {
    public readonly gamePlayerId: GamePlayerId
    public readonly gameType: GameType

    protected constructor(gamePlayerId: GamePlayerId, gameType: GameType) {
        this.gamePlayerId = gamePlayerId
        this.gameType = gameType
    }
}

@Service()
@Resolver(() => GameState)
export class GameStateResolver {
    @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao
    @Inject('Games') private readonly gameDao: IGameDao
    @Inject('Players') private readonly playerDao: IPlayerDao

    constructor(
        gameDao: IGameDao,
        gamePlayerDao: IGamePlayerDao,
        playerDao: IPlayerDao
    ) {
        this.gameDao = gameDao
        this.gamePlayerDao = gamePlayerDao
        this.playerDao = playerDao
    }

    private async getGamePlayer(id: GamePlayerId): Promise<IGamePlayer> {
        const gamePlayer = await this.gamePlayerDao.get({ id })
        if (!gamePlayer) {
            throw new ApiError(
                'Unable to look up player for this game.',
                'No game and player with this id found.'
            )
        }
        return gamePlayer
    }

    private async getPlayer(id: PlayerId): Promise<IPlayer> {
        const player = await this.playerDao.get({ id })
        if (!player) {
            throw new ApiError(
                'Unable to look up player.',
                'No game with this player found.'
            )
        }
        return player
    }

    private async getGame(id: GameId): Promise<IGame> {
        const game = await this.gameDao.get({ id })
        if (!game) {
            throw new ApiError(
                'Unable to look up game.',
                'No game with this code found.'
            )
        }
        return game
    }

    @FieldResolver(() => Player)
    async player(@Root() state: IGameState): Promise<ApiResponse<IPlayer>> {
        try {
            const gamePlayer = await this.getGamePlayer(state.gamePlayerId)
            return await this.getPlayer(gamePlayer.playerId)
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }

    @FieldResolver(() => Game)
    async game(@Root() state: IGameState): Promise<ApiResponse<IGame>> {
        try {
            const gamePlayer = await this.getGamePlayer(state.gamePlayerId)
            return await this.getGame(gamePlayer.gameId)
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }
}

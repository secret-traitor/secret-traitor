import { Field, FieldResolver, ObjectType, Resolver, Root } from 'type-graphql'
import { Inject } from 'typedi'

import { IAlliesAndEnemiesDao } from '@daos/AlliesNEnemies'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'

import { IPlayer, PlayerId } from '@entities/Player'

import { Player } from '@graphql/Player'

import { ApiError, ApiResponse } from '@shared/api'

import {
    AlliesAndEnemiesState,
    FirstHand,
    PlayerState,
    SecondHand,
    TurnState,
    TurnStatus,
} from '@games/AlliesAndEnemies'
import { GamePlayerId, IGamePlayer } from '@entities/GamePlayer'
import { GameId, IGame } from '@entities/Game'

@ObjectType()
export class CurrentTurn {
    @Field(() => Number)
    number: number

    playerId: PlayerId

    @Field(() => TurnStatus)
    status: TurnStatus
}

@Resolver(() => CurrentTurn)
export class CurrentTurnResolver {
    @Inject('AlliesAndEnemies')
    private readonly gameStateDao: IAlliesAndEnemiesDao
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
    async waitingOn(
        @Root() { playerId }: CurrentTurn
    ): Promise<ApiResponse<IPlayer | null>> {
        try {
            return this.getPlayer(playerId)
        } catch (e) {
            if (e instanceof ApiError) {
                return e
            }
            throw e
        }
    }
}

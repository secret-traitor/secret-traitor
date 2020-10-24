import { Arg, FieldResolver, ID, Query, Resolver, Root } from 'type-graphql'
import head from 'lodash/head'
import { Inject } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { GamePlayerId } from '@entities/GamePlayer'
import { GameStatus, IGame, IGameDescription } from '@entities/Game'
import { IPlayer } from '@entities/Player'

import { GameState, IGameState } from '@graphql/GameState'
import { Player } from '@graphql/Player'

import { ApiResponse, UnexpectedError } from '@shared/api'

import { Game, GameDescription, GameDescriptions } from './Game.types'
import GameManager from '@games/GameManager'

@Resolver(() => Game)
export class GameResolver {
    constructor(
        @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao,
        @Inject('Games') private readonly gameDao: IGameDao,
        @Inject('Players') private readonly playerDao: IPlayerDao
    ) {}

    @FieldResolver(() => [Player])
    async hosts(@Root() game: IGame): Promise<ApiResponse<IPlayer[]>> {
        const gamePlayers = await this.gamePlayerDao.find({
            gameId: game.id,
            host: true,
        })
        if (!gamePlayers) {
            return new UnexpectedError(
                'Unable to look up host players.',
                'No players have joined this game.'
            )
        }
        const playerIds = gamePlayers?.map((gp) => gp.playerId)
        return await this.playerDao.list({ ids: playerIds })
    }

    @FieldResolver(() => [Player], { name: 'players' })
    async players(@Root() game: IGame): Promise<IPlayer[]> {
        const gamePlayers = await this.gamePlayerDao.find({ gameId: game.id })
        const playerIds = gamePlayers?.map((gp) => gp.playerId)
        const players = await this.playerDao.list({ ids: playerIds })
        return players || []
    }

    @FieldResolver(() => GameState, { nullable: true })
    async state(
        @Arg('playId', () => ID) gamePlayerId: GamePlayerId,
        @Root() game: IGame
    ): Promise<IGameState | null> {
        const gm = new GameManager(game.id, game.type)
        const exists = await gm.exists()
        if (!exists) {
            return null
        }
        return {
            gameType: game.type,
            gamePlayerId,
        } as IGameState
    }

    @Query(() => Game, { nullable: true })
    async game(@Arg('id', () => ID) id: string): Promise<IGame | null> {
        const game = head(await this.gameDao.find({ id: id.toLowerCase() }))
        return game || null
    }

    @Query(() => [Game])
    async allGames(): Promise<IGame[]> {
        const games = await this.gameDao.all({})
        return games || []
    }

    @Query(() => [Game])
    async joinableGames(): Promise<IGame[]> {
        const games = (await this.gameDao.all({})) || []
        return games.filter((g) =>
            [GameStatus.InLobby, GameStatus.InProgress].includes(g.status)
        )
    }

    @Query(() => [GameDescription])
    gameTypes(): IGameDescription[] {
        return GameDescriptions
    }
}

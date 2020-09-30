import get from 'lodash/get'
import {
    Arg,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql'

import GameDaoMock from '@daos/Game/GameDao.mock'
import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'
import logger from '@shared/Logger'
import { GamePlayer, IGamePlayer } from '@entities/GamePlayer'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayer, Player } from '@entities/Player'

import { CreateGameInput, Game, GameType, GameTypes } from './typeDefs'
import { GameStatus, ICreateGameInput, IGame, IGameType } from './model'
import { UUID } from '@shared/uuid'

@Resolver(() => Game)
export class GameResolver {
    private gameDao: IGameDao
    private gamePlayerDao: IGamePlayerDao

    constructor() {
        this.gameDao = new GameDaoMock()
        this.gamePlayerDao = new GamePlayerDaoMock()
    }

    @Query(() => Game, { nullable: true })
    async game(@Arg('code') code: string) {
        const games = await this.gameDao.find({ code })
        return games.length > 0 ? games[0] : null
    }

    @Query(() => [Game], { nullable: false })
    async allGames() {
        return await this.gameDao.all({})
    }

    @Query(() => [GameType])
    async gameTypes(): Promise<IGameType[]> {
        return GameTypes
    }

    @Mutation(() => Game, { nullable: true })
    async createGame(
        @Arg('input', () => CreateGameInput) input: ICreateGameInput
    ): Promise<IGame | null> {
        const player: IPlayer = {
            code: input.playerCode,
        }
        const game = await this.gameDao.new({
            host: player,
            class: input.gameClass,
        })
        if (game) {
            await this.gamePlayerDao.new(game, player, true)
            return game
        }
        return null
    }

    @Mutation(() => GamePlayer, { nullable: true })
    async joinGame(
        @Arg('gameId', () => String) gameId: string,
        @Arg('playerCode', () => String) playerCode: string,
        @Arg('playerNickname', () => String) playerNickname: string
    ): Promise<IGamePlayer | null> {
        const game = await this.gameDao.get({ id: gameId })
        if (!game || game.status !== GameStatus.InLobby) {
            return null
        }
        const gamePlayers = await this.gamePlayerDao.find({
            gameId,
            playerCode,
        })
        if (gamePlayers.length > 1) {
            logger.warn(
                `There are ${
                    gamePlayers.length
                } results for GamePlayer with field values ${JSON.stringify({
                    gameId,
                    playerCode,
                })}. There should only be 1 result.`
            )
        }
        const gamePlayer: IGamePlayer = get(gamePlayers, 0, {
            gameId,
            host: false,
            id: UUID(),
            playerCode,
            playerNickname,
        })
        gamePlayer.playerNickname = playerNickname
        return await this.gamePlayerDao.put(gamePlayer)
    }

    @Mutation(() => Boolean)
    async deleteGame(@Arg('id') id: string) {
        await this.gameDao.delete({ id })
        return true
    }

    @FieldResolver((returns) => [Player], { nullable: true })
    async players(@Root() game: Game) {
        const gamePlayers = await this.gamePlayerDao.find({ gameId: game.id })
        return gamePlayers.map(
            (gamePlayer): IPlayer => ({
                code: gamePlayer.playerCode,
                nickname: gamePlayer.playerNickname,
            })
        )
    }
}

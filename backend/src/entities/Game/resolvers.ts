import {
    Arg,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql'
import get from 'lodash/get'

import GameDaoMock from '@daos/Game/GameDao.mock'
import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'

import { GraphQlPromiseResponse, UnexpectedGraphQLError } from '@shared/graphql'
import { IGamePlayer } from '@entities/GamePlayer'
import Player, { IPlayer } from '@entities/Player'

import { Game, GameType, GameTypes } from './typeDefs'
import { GameClass, GameStatus, IGame, IGameType } from './model'

@Resolver(() => Game)
export class GameResolver {
    private gameDao = new GameDaoMock()
    private gamePlayerDao = new GamePlayerDaoMock()

    @Query(() => Game, { nullable: true })
    async game(
        @Arg('code', () => String) code: string
    ): GraphQlPromiseResponse<IGame | null> {
        const games = await this.gameDao.find({ code })
        return get(games, 0, null)
    }

    @Query(() => [Game])
    async allGames(): GraphQlPromiseResponse<IGame[]> {
        return (await this.gameDao.all()) || []
    }

    @Query(() => [Game])
    async joinableGames(): GraphQlPromiseResponse<IGame[]> {
        return (await this.gameDao.find({ status: GameStatus.InLobby })) || []
    }

    @Query(() => [GameType])
    async gameTypes(): GraphQlPromiseResponse<IGameType[]> {
        return GameTypes
    }

    @Mutation(() => Game, { nullable: true })
    async createGame(
        @Arg('playerCode') playerCode: string,
        @Arg('gameClass', () => GameClass) gameClass: GameClass
    ): GraphQlPromiseResponse<IGame | null> {
        const game = await this.gameDao.new({
            hostPlayerCode: playerCode,
            class: gameClass,
        })
        if (game) {
            await this.gamePlayerDao.new({
                gameId: game.id,
                playerCode: game.hostPlayerCode,
                host: true,
            })
            return game
        }
        return new UnexpectedGraphQLError('Unable to create new game.')
    }

    @Mutation(() => Boolean)
    async deleteGame(
        @Arg('id', () => Boolean) id: string
    ): GraphQlPromiseResponse<boolean> {
        return (await this.gameDao.delete({ id })) || false
    }

    @FieldResolver(() => Player)
    async host(@Root() game: Game): GraphQlPromiseResponse<IPlayer> {
        const gamePlayers = await this.gamePlayerDao.find({
            playerCode: game.hostPlayerCode,
        })
        if (gamePlayers.length > 0) {
            const gamePlayer: IGamePlayer = gamePlayers[0]
            const player: IPlayer = {
                code: gamePlayer.playerCode,
                nickname: gamePlayer.playerNickname,
            }
            return player
        }
        return new UnexpectedGraphQLError('Unable to look up host player.')
    }

    @FieldResolver(() => [Player])
    async players(@Root() game: Game): GraphQlPromiseResponse<IPlayer[]> {
        const gamePlayers = await this.gamePlayerDao.find({ gameId: game.id })
        return (
            gamePlayers?.map(
                (gamePlayer): IPlayer => ({
                    code: gamePlayer.playerCode,
                    nickname: gamePlayer.playerNickname,
                })
            ) || []
        )
    }
}

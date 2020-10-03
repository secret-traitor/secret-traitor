import {
    Arg,
    FieldResolver,
    Mutation,
    PubSub,
    Query,
    Resolver,
    Root,
} from 'type-graphql'
import get from 'lodash/get'
import { PubSubEngine } from 'graphql-subscriptions'

import GameDaoMock from '@daos/Game/GameDao.mock'
import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'

import logger from '@shared/Logger'
import { Game, GameStatus } from '@entities/Game'
import {
    GraphQlPromiseResponse,
    UnexpectedGraphQLError,
    GraphQLError,
} from '@shared/graphql'
import { IGameDao } from '@daos/Game'
import { IGamePlayer } from '@entities/GamePlayer/model'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayer, Player } from '@entities/Player'
import { UUID } from '@shared/uuid'

import { GamePlayer } from './typeDefs'

@Resolver(() => GamePlayer)
export class GamePlayerResolver {
    private gameDao: IGameDao = new GameDaoMock()
    private gamePlayerDao: IGamePlayerDao = new GamePlayerDaoMock()

    @Query(() => GamePlayer, { nullable: true })
    async gamePlayer(
        @Arg('gameCode', () => String) gameCode: string,
        @Arg('playerCode', () => String) playerCode: string
    ): GraphQlPromiseResponse<IGamePlayer | null> {
        const games = await this.gameDao.find({ code: gameCode })
        if (!games) return null
        const gamePlayers = await this.gamePlayerDao.find({
            playerCode,
            gameId: games[0].id,
        })
        return get(gamePlayers, 0, null)
    }

    @Mutation(() => GamePlayer, { nullable: true })
    async joinGame(
        @Arg('gameId', () => String) gameId: string,
        @Arg('playerCode', () => String) playerCode: string,
        @Arg('playerNickname', () => String) playerNickname: string,
        @PubSub() pubSub: PubSubEngine
    ): GraphQlPromiseResponse<IGamePlayer | null> {
        const game = await this.gameDao.get({ id: gameId })
        if (!game) {
            return new GraphQLError(
                'Unable to look up game.',
                'No game with this id found.',
                'Please make sure a game exists before joining.'
            )
        }
        if (game.status !== GameStatus.InLobby) {
            return new GraphQLError(
                'Unable to join a game.',
                'Games are only join-able when in lobby.',
                'Please join games from the home page or using recently copied links.'
            )
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
        const gamePlayer = await this.gamePlayerDao.put({
            ...get(gamePlayers, 0, {
                gameId,
                host: false,
                id: UUID(),
                playerCode,
            }),
            playerNickname,
        })
        if (!gamePlayer) {
            return new UnexpectedGraphQLError('Unable to create game player.')
        }
        pubSub.publish(`PLAY:${gameId}`, {})
        return gamePlayer
    }

    @FieldResolver(() => Player)
    async player(
        @Root() gamePlayer: IGamePlayer
    ): GraphQlPromiseResponse<IPlayer> {
        return {
            code: gamePlayer.playerCode,
            nickname: gamePlayer.playerNickname,
        }
    }

    @FieldResolver(() => Game)
    async game(@Root() gamePlayer: IGamePlayer): GraphQlPromiseResponse<Game> {
        const game = await this.gameDao.get({ id: gamePlayer.gameId })
        if (!game) {
            return new UnexpectedGraphQLError(
                'Unable to look up game.',
                'No game with this id found.'
            )
        }
        return game
    }
}

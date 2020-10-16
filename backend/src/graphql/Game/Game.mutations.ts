import { Inject } from 'typedi'
import { Arg, Mutation, Resolver } from 'type-graphql'

import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { IGame, GameType } from '@entities/Game'

import { Game } from '@graphql/Game'

import { ApiResponse, UnexpectedApiError } from '@shared/api'

@Resolver()
export class GameMutations {
    @Inject('GamePlayers') private readonly gamePlayers: IGamePlayerDao
    @Inject('Games') private readonly games: IGameDao
    @Inject('Players') private readonly players: IPlayerDao

    constructor(
        gamePlayers: IGamePlayerDao,
        games: IGameDao,
        players: IPlayerDao
    ) {
        this.gamePlayers = gamePlayers
        this.games = games
        this.players = players
    }

    @Mutation(() => Game, { nullable: true })
    async createGame(
        @Arg('playerCode') playerCode: string,
        @Arg('gameType', () => GameType) gameType: GameType
    ): Promise<ApiResponse<IGame | null>> {
        const player = await this.players.new({ code: playerCode })
        if (!player) {
            return new UnexpectedApiError('Unable to create new player.')
        }
        const game = await this.games.new({ type: gameType })
        if (!game) {
            return new UnexpectedApiError('Unable to create new game.')
        }
        await this.gamePlayers.new({
            gameId: game.id,
            playerId: player.id,
            host: true,
        })
        return game
    }

    @Mutation(() => Boolean)
    async deleteGame(
        @Arg('id', () => Boolean) id: string
    ): Promise<ApiResponse<boolean>> {
        return (await this.games.delete({ id })) || false
    }
}

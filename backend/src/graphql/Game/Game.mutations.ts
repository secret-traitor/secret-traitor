import { Inject, Service } from 'typedi'
import { Arg, Mutation, Resolver } from 'type-graphql'

import { Game } from '@graphql/Game/Game.types'
import { GraphQlPromiseResponse, UnexpectedGraphQLError } from '@shared/graphql'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { GameType, IGame } from '@entities/Game'

@Service()
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
    ): GraphQlPromiseResponse<IGame | null> {
        const player = await this.players.new({ code: playerCode })
        if (!player) {
            return new UnexpectedGraphQLError('Unable to create new player.')
        }
        const game = await this.games.new({ type: gameType })
        if (!game) {
            return new UnexpectedGraphQLError('Unable to create new game.')
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
    ): GraphQlPromiseResponse<boolean> {
        return (await this.games.delete({ id })) || false
    }
}

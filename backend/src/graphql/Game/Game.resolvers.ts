import { FieldResolver, Resolver, Root } from 'type-graphql'
import map from 'lodash/map'
import { Inject } from 'typedi'

import { GraphQlPromiseResponse, UnexpectedGraphQLError } from '@shared/graphql'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'
import { IPlayer } from '@entities/Player'
import { Player } from '@graphql/Player'

import { Game } from './Game.types'
import { IGame } from '@entities/Game'
import { IGameDao } from '@daos/Game'

@Resolver(() => Game)
export class GameResolver {
    @Inject('GamePlayers') private readonly gamePlayerDao: IGamePlayerDao
    @Inject('Games') private readonly gameDao: IGameDao
    @Inject('Players') private readonly playerDao: IPlayerDao

    constructor(
        gamePlayerDao: IGamePlayerDao,
        gameDao: IGameDao,
        playerDao: IPlayerDao
    ) {
        this.gamePlayerDao = gamePlayerDao
        this.gameDao = gameDao
        this.playerDao = playerDao
    }

    @FieldResolver(() => [Player])
    async hosts(@Root() game: IGame): GraphQlPromiseResponse<IPlayer[]> {
        const gamePlayers = await this.gamePlayerDao.find({
            gameId: game.id,
            host: true,
        })
        if (!gamePlayers) {
            return new UnexpectedGraphQLError(
                'Unable to look up host players.',
                'No players have joined this game.'
            )
        }
        return await this.playerDao.list({
            ids: gamePlayers.map((gp) => gp.playerId),
        })
    }

    @FieldResolver(() => [Player], { name: 'players' })
    async players(@Root() game: IGame): GraphQlPromiseResponse<IPlayer[]> {
        const gamePlayers = await this.gamePlayerDao.find({ gameId: game.id })
        const playerId = map(gamePlayers, (gp) => gp.playerId)
        return await this.playerDao.list({ ids: playerId })
    }
}

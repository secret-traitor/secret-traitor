import { FieldResolver, Resolver, Root } from 'type-graphql'
import { Inject, Service } from 'typedi'

import { Game } from '@graphql/Game'

import { GraphQlPromiseResponse, UnexpectedGraphQLError } from '@shared/graphql'
import { IGame } from '@entities/Game'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayer } from '@entities/Player'
import { IPlayerDao } from '@daos/Player'
import { Player } from '@graphql/Player'

import { GamePlayer } from './GamePlayer.types'
import { IGamePlayer } from '@entities/GamePlayer'

@Service()
@Resolver(() => GamePlayer)
export class GamePlayerResolver {
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

    @FieldResolver(() => Player)
    async player(
        @Root() gamePlayer: IGamePlayer
    ): GraphQlPromiseResponse<IPlayer> {
        const player = await this.playerDao.get({ id: gamePlayer.playerId })
        if (!player) {
            return new UnexpectedGraphQLError(
                'Unable to look up player.',
                'No player with this id found.'
            )
        }
        return player
    }

    @FieldResolver(() => Game)
    async game(@Root() gamePlayer: IGamePlayer): GraphQlPromiseResponse<IGame> {
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

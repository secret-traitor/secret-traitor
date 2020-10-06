import { FieldResolver, Resolver, Root } from 'type-graphql'
import { Inject, Service } from 'typedi'

import { IGameDao } from '@daos/Game'
import { IPlayerDao } from '@daos/Player'
import { IGame } from '@entities/Game'
import { IPlayer } from '@entities/Player'
import { Game } from '@graphql/Game'
import { Player } from '@graphql/Player'
import { PlayEvent } from '@graphql/PlayEvent'
import { GraphQlPromiseResponse, UnexpectedGraphQLError } from '@shared/graphql'

@Service()
@Resolver(() => PlayEvent)
export class GamePlayerResolver {
    @Inject('Games') private readonly gameDao: IGameDao
    @Inject('Players') private readonly playerDao: IPlayerDao

    constructor(gameDao: IGameDao, playerDao: IPlayerDao) {
        this.gameDao = gameDao
        this.playerDao = playerDao
    }

    @FieldResolver(() => Player)
    async player(
        @Root() playEvent: PlayEvent
    ): GraphQlPromiseResponse<IPlayer> {
        const player = await this.playerDao.get({ id: playEvent.playerId })
        if (!player) {
            return new UnexpectedGraphQLError(
                'Unable to look up player.',
                'No player with this id found.'
            )
        }
        return player
    }

    @FieldResolver(() => Game)
    async game(@Root() playEvent: PlayEvent): GraphQlPromiseResponse<IGame> {
        const game = await this.gameDao.get({ id: playEvent.gameId })
        if (!game) {
            return new UnexpectedGraphQLError(
                'Unable to look up game.',
                'No game with this id found.'
            )
        }
        return game
    }
}

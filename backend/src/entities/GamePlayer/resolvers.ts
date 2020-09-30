import { FieldResolver, Resolver, Root } from 'type-graphql'

import GameDaoMock from '@daos/Game/GameDao.mock'

import { Game } from '@entities/Game'
import { IGameDao } from '@daos/Game'
import { IGamePlayer } from '@entities/GamePlayer/model'
import { IPlayer, Player } from '@entities/Player'

import { GamePlayer } from './typeDefs'

@Resolver(() => GamePlayer)
export class GamePlayerResolver {
    private gameDao: IGameDao = new GameDaoMock()

    @FieldResolver((returns) => Player)
    async player(@Root() gamePlayer: IGamePlayer) {
        const player: IPlayer = {
            code: gamePlayer.playerCode,
            nickname: gamePlayer.playerNickname,
        }
        return player
    }

    @FieldResolver((returns) => Game)
    async game(@Root() gamePlayer: IGamePlayer) {
        const game = await this.gameDao.get({ id: gamePlayer.gameId })
        return game as Game
    }
}

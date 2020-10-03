import { Arg, FieldResolver, Query, Resolver, Root } from 'type-graphql'

import GameDaoMock from '@daos/Game/GameDao.mock'

import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'
import { AlliesAndEnemiesState } from '@entities/AlliesAndEnemies'
import { Game, GameClass } from '@entities/Game'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IGameState } from '@entities/GameState/model'
import { IPlayer, Player } from '@entities/Player'

import { GameState } from './typeDefs'

@Resolver(() => GameState)
export class GameStateResolver {
    private gameDao: IGameDao = new GameDaoMock()
    private gamePlayerDao: IGamePlayerDao = new GamePlayerDaoMock()

    @FieldResolver(() => Game)
    async game(@Root() state: GameState) {
        return await this.gameDao.get({ id: state.gameId })
    }

    @FieldResolver(() => [Player])
    async players(@Root() state: GameState) {
        const gamePlayers = await this.gamePlayerDao.find({
            gameId: state.gameId,
        })
        return gamePlayers.map(
            (gamePlayer): IPlayer => ({
                code: gamePlayer.playerCode,
                nickname: gamePlayer.playerNickname,
            })
        )
    }

    @Query(() => GameState, { nullable: true })
    async gameState(@Arg('gameId') gameId: string): Promise<IGameState | null> {
        const game = await this.gameDao.get({ id: gameId })
        if (game?.class === GameClass.AlliesNEnemies) {
            return new AlliesAndEnemiesState(gameId)
        }
        return null
    }
}

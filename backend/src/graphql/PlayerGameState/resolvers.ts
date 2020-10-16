// import {
//     Arg,
//     Args,
//     FieldResolver,
//     Mutation,
//     Query,
//     Resolver,
//     ResolverFilterData,
//     Root,
//     Subscription,
// } from 'type-graphql'
//
// import GameDaoMock from '@daos/Game/GameDao.mock'
// import GamePlayerDaoMock from '@daos/GamePlayer/GamePlayerDao.mock'
//
// import { AlliesAndEnemiesPlayerState } from '@entities/AlliesAndEnemies'
// import { Game, GameClass } from '@entities/Game'
// import {
//     GamePlayerState,
//     GamePlayerStateSubArgs,
// } from '@entities/GameState/typeDefs'
// import { GraphQlPromiseResponse, UnexpectedApiError } from '@shared/graphql'
// import { IGameDao } from '@daos/Game'
// import { IGamePlayerDao } from '@daos/GamePlayer'
// import { IGamePlayerState } from '@entities/GameState/model'
//
// @Resolver(() => GamePlayerState)
// export class GamePlayerStateResolver {

// @FieldResolver(() => Game)
// async game(@Root() state: IGamePlayerState) {
//     const gamePlayer = await this.gamePlayerDao.get({
//         id: state.gamePlayerId,
//     })
//     if (!gamePlayer) {
//         return new UnexpectedApiError(
//             'Unable to look up game player.',
//             'No game player with this id found.'
//         )
//     }
//     const game = await this.gameDao.get({ id: gamePlayer?.gameId })
//     if (!game) {
//         return new UnexpectedApiError(
//             'Unable to look up game.',
//             'No game with this id found.'
//         )
//     }
//     return game
// }

// @Query(() => GamePlayerState, { nullable: true })
// async playerGameState(
//     @Arg('playerGameId') playerGameId: string
// ): GraphQlPromiseResponse<GamePlayerState | null> {
//     const gamePlayer = await this.gamePlayerDao.get({gameId: id: playerGameId })
//     if (!gamePlayer) {
//         return new UnexpectedApiError(
//             'Unable to look up game player.',
//             'No game player with this id found.'
//         )
//     }
//     const game = await this.gameDao.get({ id: gamePlayer?.gameId })
//     if (game?.class === GameClass.AlliesNEnemies) {
//         return new AlliesAndEnemiesPlayerState(playerGameId)
//     }
//     return new UnexpectedApiError(
//         'Unable to look up game.',
//         'No game with this id found.'
//     )
// }

// @Subscription(() => GamePlayerState, {
//     topics: ({ args }) => `PLAY:${args.gameId}`,
//     filter: ({
//         gamePlayerId,
//         args,
//     }: ResolverFilterData<IGamePlayerState, GamePlayerStateSubArgs>) =>
//         gamePlayerId.gamePlayerId === args.gamePlayerId,
// })
// async play(
//     @Args() { gamePlayerId, gameId }: GamePlayerStateSubArgs,
//     @Root() state: GamePlayerState
// ) {
//     const gamePlayer = await this.gamePlayerDao.get({ id: gamePlayerId })
//     if (!gamePlayer) {
//         return new UnexpectedApiError(
//             'Unable to look up game player.',
//             'No game player with this id found.'
//         )
//     }
//     return { ...state, gameId: gamePlayer?.gameId }
// }
// }

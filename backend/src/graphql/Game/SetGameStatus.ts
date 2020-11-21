import {
    Arg,
    Field,
    ID,
    Mutation,
    ObjectType,
    PubSub,
    Resolver,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'

import GamesClient from '@clients/Games'
import { GameId, GameStatus, IGame } from '@entities/Game'
import { PlayerId } from '@entities/Player'
import {
    ActiveAlliesAndEnemiesState,
    StandardConfiguration,
} from '@games/AlliesAndEnemies'
import { Event } from '@graphql/Event'
import { GameEvent } from '@graphql/GameEvent'
import { ApiResponse, DescriptiveError } from '@shared/api'
import { getTopicName, Topics } from '@shared/topics'

type GameStateEvent = {
    game: IGame
    newStatus: GameStatus
    oldStatus: GameStatus
    playerId: PlayerId
}

@ObjectType({ implements: [Event, GameEvent] })
export class GameStatusEvent extends GameEvent {
    @Field(() => GameStatus, { name: 'changedTo' })
    public readonly newStatus: GameStatus
    @Field(() => GameStatus, { name: 'changedFrom' })
    public readonly oldStatus: GameStatus

    constructor({ game, newStatus, oldStatus, playerId }: GameStateEvent) {
        const state = { gameId: game.id, gameType: game.type, playerId }
        super(state, playerId, GameStatusEvent.name)
        this.newStatus = newStatus
        this.oldStatus = oldStatus
    }
}

@Resolver()
export class SetGameStatusResolver {
    @Mutation(() => GameStatusEvent, { nullable: true })
    async setGameStatus(
        @Arg('gameId', () => ID) gameId: GameId,
        @Arg('playerId', () => ID) playerId: PlayerId,
        @Arg('status', () => GameStatus) status: GameStatus,
        @PubSub() pubSub: PubSubEngine
    ): Promise<ApiResponse<GameStatusEvent | null>> {
        const oldGame = await GamesClient.games.get(gameId)
        if (!oldGame) {
            return new DescriptiveError('')
        }
        const newGame = { ...oldGame, status }
        if (
            oldGame.status === GameStatus.InLobby &&
            newGame.status === GameStatus.InProgress
        ) {
            const players = await GamesClient.players.find({
                PK: {
                    ComparisonOperator: 'CONTAINS',
                    AttributeValueList: [gameId],
                },
                Name: { ComparisonOperator: 'NOT_NULL' },
            })
            if (!players) {
                return new DescriptiveError('no players')
            }
            const configuration = StandardConfiguration[players.length] || null
            if (!configuration) {
                return new DescriptiveError('no configuration')
            }
            const state = ActiveAlliesAndEnemiesState.newGame(
                gameId,
                players,
                configuration,
                playerId
            )
            await state.save()
        } else {
            await GamesClient.state.delete(gameId)
        }
        await GamesClient.games.put(newGame)
        const payload = new GameStatusEvent({
            game: newGame,
            playerId,
            oldStatus: oldGame.status,
            newStatus: newGame.status,
        })
        await pubSub.publish(getTopicName(Topics.Play, newGame.id), payload)
        return payload
    }
}

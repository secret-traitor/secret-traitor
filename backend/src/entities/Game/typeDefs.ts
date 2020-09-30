import {
    Field,
    ID,
    InputType,
    ObjectType,
    registerEnumType,
} from 'type-graphql'
import { Player } from '@entities/Player'

import {
    GameClass,
    GameStatus,
    IGame,
    IGameType,
    ICreateGameInput,
} from './model'

@ObjectType({ description: 'The current state of a game' })
export class Game implements IGame {
    @Field(() => ID)
    public id: string

    @Field(() => GameClass)
    public class: GameClass

    @Field(() => String)
    public code: string

    @Field(() => Player)
    public host: Player

    @Field(() => GameStatus)
    public status: GameStatus
}

@InputType({})
export class CreateGameInput implements ICreateGameInput {
    @Field(() => String) // it's very important
    playerCode: string
    @Field(() => GameClass)
    gameClass: GameClass
}

@ObjectType({ description: '' })
export class GameType implements IGameType {
    @Field(() => String)
    public description: string

    @Field(() => String)
    public displayName: string

    @Field(() => GameClass)
    public gameClass: GameClass
}

export const GameTypes: GameType[] = [
    {
        description:
            'A social deduction game. Clone of a game named after a certain WWII dictator.',
        displayName: 'Allies and Enemies',
        gameClass: GameClass.AlliesNEnemies,
    },
]

registerEnumType(GameStatus, {
    name: 'GameStatus',
    description:
        'The current status of a game. Designates whether a game is complete, joinable, or playable.',
})

registerEnumType(GameClass, {
    name: 'GameClass',
    description:
        'The classification of a game. This property is used to determine other more specific properties of a specific game.',
})

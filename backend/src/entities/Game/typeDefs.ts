import { Field, ID, ObjectType, registerEnumType } from 'type-graphql'

import { GameClass, GameStatus, IGame, IGameType } from './model'

@ObjectType({ description: 'Provides high level details about a game.' })
export class Game implements IGame {
    @Field(() => ID)
    public id: string

    @Field(() => GameClass)
    public class: GameClass

    @Field(() => String)
    public code: string

    hostPlayerCode: string

    @Field(() => GameStatus)
    public status: GameStatus
}

@ObjectType({
    description:
        'Game types determine the games that are playable. Includes a display name, description and unique code.',
})
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

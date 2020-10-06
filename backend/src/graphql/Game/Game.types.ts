import { Field, ID, ObjectType, registerEnumType } from 'type-graphql'
import {
    GameId,
    IGame,
    GameType as Type,
    GameStatus,
    IGameDescription,
} from '@entities/Game'

@ObjectType({ description: 'Provides high level details about a game.' })
export class Game implements IGame {
    @Field(() => ID)
    public id: GameId

    @Field(() => Type)
    public type: Type

    @Field(() => String)
    public code: string

    @Field(() => GameStatus)
    public status: GameStatus
}

@ObjectType({
    description:
        'Game types determine the games that are playable. Includes a display name, description and unique code.',
})
export class GameDescription implements IGameDescription {
    @Field(() => String)
    public description: string

    @Field(() => String)
    public displayName: string

    @Field(() => Type)
    public type: Type
}

export const GameDescriptions: GameDescription[] = [
    {
        description:
            'A social deduction game. Clone of a game named after a certain WWII dictator.',
        displayName: 'Allies and Enemies',
        type: Type.AlliesNEnemies,
    },
]

registerEnumType(GameStatus, {
    name: 'GameStatus',
    description:
        'The current status of a game. Designates whether a game is complete, joinable, or playable.',
})

registerEnumType(Type, {
    name: 'GameType',
    description:
        'This property is used to determine other more specific properties of a specific game.',
})

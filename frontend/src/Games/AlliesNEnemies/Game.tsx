import React from 'react'

type Action = {
    name: string
}

type Board = {
    allyCardCount: Number
    enemyCardCount: Number
    actions: [Action?, Action?, Action?, Action?, Action?]
}

enum Suit {
    Ally,
    Enemy,
}

type Card = {
    suit: Suit
}

type Deck = {
    draw: Card[]
    discard: Card[]
}

enum Faction {
    Ally,
    Enemy,
    EnemyLeader,
}

enum RoleType {
    None,
    President,
    Governor,
}

type DefaultRole = {
    __typename: RoleType.None
}

type President = {
    __typename: RoleType.President
    hand: [Card, Card, Card]
}

type Governor = {
    __typename: RoleType.Governor
    hand: [Card, Card]
}

type Role = DefaultRole | President | Governor

type Player = {
    faction: Faction
    currentRole: Role
    playHistory: Card[]
}

type GameState = {
    deck: Deck
    players: Player[]
    failedElectionCount: Number
}

type InitialState = {
    playerCount: Number
    config: {
        termLimits: boolean
    }
}

const Game: React.FC = () => <></>

export default Game

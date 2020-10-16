import { Component } from 'react'

export enum BoardAction {
    None,
    InvestigateLoyalty = 'InvestigateLoyalty',
    SpecialElection = 'SpecialElection',
    PolicyPeak = 'PolicyPeak',
    Execution = 'Execution',
}

export enum CardSuit {
    Ally,
    Enemy,
}

export type Card = {
    suit: CardSuit
}

export type BoardRow = {
    cards: Card[]
    maxCards: number
}

export type BoardState = {
    actions: BoardAction[]
    ally: BoardRow
    enemy: BoardRow
}

export enum PlayerAction {
    None,
    Nominate,
    Vote,
    PlayCard,
    TakeBoardAction,
}

export type Player = {
    id: string
    nickname: string
}

export enum TurnStatus {
    Nomination,
    Election,
    FirstHand,
    SecondHand,
}

export type TurnState = {
    number: number
    waitingOn: Player
    status: TurnStatus
}

export type AlliesAndEnemiesState = {
    currentTurn: TurnState
    player: Player
    playerAction: PlayerAction
    board: BoardState
}

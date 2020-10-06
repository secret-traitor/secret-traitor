import { GameStatus } from 'types/Game'

export type Game = {
    code: string
    status: GameStatus
}

export type Player = {
    code: string
    nickname: string
}

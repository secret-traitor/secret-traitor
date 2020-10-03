import { GameStatus } from 'types/Game'

export type Game = {
    status: GameStatus
}

export type Player = {
    nickname: string
}

export type GamePlayer = {
    game: Game
    player: Player
}

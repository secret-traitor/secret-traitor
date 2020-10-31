export type PlayerId = string

export interface IPlayer {
    readonly id: PlayerId
    readonly nickname?: string
}

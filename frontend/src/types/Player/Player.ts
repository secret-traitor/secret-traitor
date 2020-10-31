export type Player = {
    id: string
    nickname: string
}

export type HostPlayer = Player & { host: boolean }

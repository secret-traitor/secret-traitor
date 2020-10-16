export type Player = {
    code: string
    id: string
    nickname: string
}

export type HostPlayer = Player & { host: boolean }

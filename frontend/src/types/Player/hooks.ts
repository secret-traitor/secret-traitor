import { v4 as uuid } from 'uuid'
import store from 'store2'
import { useRef, useState } from 'react'

export const usePlayerId = () => {
    const key = 'playerId'
    const playerId = useRef<string>(store.get(key))
    if (!playerId.current) {
        playerId.current = uuid()
        store.set(key, playerId.current)
    }
    return playerId.current
}
export const usePlayerNickname = (): [string, (nickname: string) => void] => {
    const key = 'playerNickname'
    const [nickname, setNickname] = useState<string>(store.get(key))
    return [
        nickname,
        (nickname: string) => {
            setNickname(nickname)
            store.set(key, nickname)
        },
    ]
}

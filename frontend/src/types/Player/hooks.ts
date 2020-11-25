import { v4 as uuid } from 'uuid'
import store from 'store2'
import { useRef } from 'react'

export const usePlayerId = () => {
    const key = 'playerId'
    const playerId = useRef<string>(store.get(key))
    if (!playerId.current) {
        playerId.current = uuid()
        store.set(key, playerId.current)
    }
    return playerId.current
}

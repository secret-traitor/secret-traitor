import { isEmpty } from 'lodash'
import { useCookies } from 'react-cookie'

import { v4 as uuid } from 'uuid'

export const usePlayerId = () => {
    const cookieName = 'playerId'
    const [{ [cookieName]: cookie }, setCookie] = useCookies([cookieName])
    if (isEmpty(cookie)) {
        setCookie(cookieName, uuid())
    }
    console.log(`use player id: ${cookie}`)
    return cookie
}

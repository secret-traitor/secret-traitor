import { isEmpty } from 'lodash'
import { useCookies } from 'react-cookie'

import { v4 as uuid } from 'uuid'

export const usePlayerCode = () => {
    const cookieName = 'player-id'
    const [{ [cookieName]: cookie }, setCookie] = useCookies([cookieName])
    if (isEmpty(cookie)) {
        setCookie(cookieName, uuid())
    }
    return cookie
}

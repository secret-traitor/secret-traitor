import React, { useEffect } from 'react'
import { RedirectProps, useHistory } from 'react-router'

const DEFAULT_DELAY = 3000

export type DelayedRedirectProps = RedirectProps & {
    delay?: number
    replace?: boolean
}

const DelayedRedirect: React.FC<DelayedRedirectProps> = ({
    replace = false,
    delay = DEFAULT_DELAY,
    to,
}) => {
    const history = useHistory()
    const timeout = setTimeout(() => {
        console.log('here i go...', { replace })
        if (replace) {
            history.replace(to)
        } else {
            history.push(to)
        }
    }, delay)
    useEffect(() => {
        return () => {
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [timeout])
    return <></>
}

export default DelayedRedirect

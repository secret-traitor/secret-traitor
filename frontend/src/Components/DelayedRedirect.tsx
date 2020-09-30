import React, { useEffect } from 'react'
import { RedirectProps, useHistory } from 'react-router'

type DelayedRedirectProps = RedirectProps & {
    delay: number
    replace?: boolean
}

const DelayedRedirect: React.FC<DelayedRedirectProps> = ({
    replace = false,
    delay,
    to,
}) => {
    const history = useHistory()
    const timeout = setTimeout(() => {
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

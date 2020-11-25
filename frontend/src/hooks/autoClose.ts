import { useEffect, useState } from 'react'

export const useAutoClose = (time: number) => {
    const [open, setOpen] = useState(true)
    const close = () => setOpen(false)
    useEffect(() => {
        const timeout = setTimeout(close, time)
        return () => clearTimeout(timeout)
    }, [setOpen, time])
    return [open, close]
}
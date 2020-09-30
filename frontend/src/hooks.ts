import { useEffect, useState } from 'react'
import { useClipboard } from 'use-clipboard-copy'

export const usePageTitle = (title: string): void => {
    useEffect(() => {
        document.title = title
    }, [title])
}

export const useClipboardCopy = () => {
    const { copy: copyFn } = useClipboard()
    const [copied, setCopied] = useState(false)
    const copy = (text: string): void => {
        copyFn(text)
        setCopied(true)
    }
    return [copy, copied]
}

export const useAutoClose = (time: number) => {
    const [open, setOpen] = useState(true)
    const close = () => setOpen(false)
    useEffect(() => {
        const timeout = setTimeout(close, time)
        return () => clearTimeout(timeout)
    }, [setOpen, time])
    return [open, close]
}

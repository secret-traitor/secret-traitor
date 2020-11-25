import { useClipboard } from 'use-clipboard-copy'
import { useState } from 'react'

export const useClipboardCopy = () => {
    const { copy: copyFn } = useClipboard()
    const [copied, setCopied] = useState(false)
    const copy = (text: string): void => {
        copyFn(text)
        setCopied(true)
    }
    return [copy, copied]
}
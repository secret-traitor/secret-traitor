import { useEffect, useState } from 'react'
import { useClipboard } from 'use-clipboard-copy'
import {
    useQuery,
    QueryHookOptions,
} from '@apollo/react-hooks'
import { DocumentNode } from 'graphql'
import { OperationVariables, QueryResult } from '@apollo/react-common'

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

export function usePollingQuery<TData = any, TVariables = OperationVariables>(
    query: DocumentNode,
    options?: QueryHookOptions<TData, TVariables>,
    pollInterval: number = 3000,
    stopPollingAfter: number = 60000
): QueryResult<TData, TVariables> {
    const results = useQuery<TData, TVariables>(query, {
        ...options,
        // using this poll interval will cause the component to continue to poll even after unmounting
        pollInterval: undefined,
    })
    const { startPolling, stopPolling } = results
    useEffect(() => {
        startPolling(pollInterval)
        if (stopPollingAfter && stopPollingAfter > 0) {
            const timeout = setTimeout(stopPolling, stopPollingAfter)
            return () => {
                stopPolling()
                clearTimeout(timeout)
            }
        }
        return stopPolling
    }, [pollInterval, startPolling, stopPolling, stopPollingAfter])
    return results
}

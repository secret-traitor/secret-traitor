import { OperationVariables, QueryResult } from '@apollo/react-common'
import { DocumentNode } from 'graphql'
import { QueryHookOptions, useMutation, useQuery } from '@apollo/react-hooks'
import { useEffect } from 'react'
import {
    MutationHookOptions,
    MutationTuple,
} from '@apollo/react-hooks/lib/types'

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

export const useErrorHandlingMutation = <
    TData = any,
    TVariables = OperationVariables
>(
    mutation: DocumentNode,
    options?: MutationHookOptions<TData, TVariables>
): MutationTuple<TData, TVariables> =>
    useMutation(mutation, {
        ...options,
        onError: options?.onError ? options.onError : () => ({}),
    })

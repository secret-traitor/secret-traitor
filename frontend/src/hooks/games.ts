import { OperationVariables } from '@apollo/react-common'
import { DocumentNode } from 'graphql'
import {
    MutationHookOptions,
    MutationTuple,
} from '@apollo/react-hooks/lib/types'
import store from 'store2'
import { useErrorHandlingMutation } from './apollo'
import { useRef } from 'react'

export const useGameMutation = <TData = any, TVariables = OperationVariables>(
    mutation: DocumentNode,
    gameId: string,
    options?: MutationHookOptions<TData, TVariables>
): MutationTuple<TData, TVariables> => {
    const key = `SecretTraitor::${gameId}::errors`
    const errors = useRef<Error[]>(store.get(key) ?? [])
    return useErrorHandlingMutation(mutation, {
        ...options,
        onError: (error) => {
            errors.current.push(error)
            if (options?.onError) {
                options.onError(error)
            }
            store.set(key, errors.current)
        },
    })
}

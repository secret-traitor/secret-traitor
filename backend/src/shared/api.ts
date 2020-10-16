import { ApolloError } from 'apollo-server'

export type ApiResponse<T> = T | ApolloError

export class ApiError extends ApolloError {
    constructor(what: string, why?: string, how?: string) {
        super([what, why, how].filter(Boolean).join(' '))
    }
}

export class UnexpectedApiError extends ApiError {
    private static how =
        'This is an unexpected error, please contact support if issue persists.'

    constructor(what: string, why?: string, how?: string) {
        super(what, why, how || UnexpectedApiError.how)
    }
}

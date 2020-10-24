import { ApolloError } from 'apollo-server'

export type ApiResponse<T> = T | ApolloError | ApolloError[]

export class DescriptiveError extends ApolloError {
    constructor(
        public readonly what: string,
        public readonly why?: string,
        public readonly how?: string,
        public readonly error?: Error
    ) {
        super([what, why, how].filter(Boolean).join(' '))
    }
}

export class UnexpectedError extends DescriptiveError {
    private static how =
        'This is an unexpected error, please contact support if issue persists.'

    constructor(what: string, why?: string, error?: Error) {
        super(what, why, UnexpectedError.how, error)
    }
}

import { ApolloError } from 'apollo-server'
import { GraphQLError as BaseGraphQLError } from 'graphql'

export type GraphQlResponse<T> = T | BaseGraphQLError
export type GraphQlPromiseResponse<T> = Promise<GraphQlResponse<T>>

export class GraphQLError extends ApolloError {
    constructor(what: string, why?: string, how?: string) {
        super([what, why, how].filter(Boolean).join(' '))
    }
}

export class UnexpectedGraphQLError extends GraphQLError {
    private static how =
        'This is an unexpected error, please contact support if issue persists.'
    constructor(what: string, why?: string) {
        super(what, why, UnexpectedGraphQLError.how)
    }
}

import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { ApolloError, gql } from 'apollo-server'
import { GraphQLError as BaseGraphQLError } from 'graphql'

export const loadSchemaFromFile = (...filenames: string[]) => gql`
    ${filenames
        .map((filename) => fs.readFileSync(filename, 'utf8').toString())
        .join('\n')}
`

export const loadSchemaFromDir = (...dirs: string[]) =>
    dirs.flatMap((dir: string) =>
        glob
            .sync('**/*.graphql', { cwd: dir })
            .map((f: string) => loadSchemaFromFile(path.join(dir, f)))
    )

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

import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { gql } from 'apollo-server'

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

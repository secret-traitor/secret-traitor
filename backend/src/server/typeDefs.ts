import fs from 'fs'
import path from 'path'

import { loadSchemaFromDir } from '../lib/GraphQL'

const schemaPath = '../schema/'
if (!fs.existsSync(schemaPath)) {
    throw new Error('Unable to read schema from: ' + path.join(schemaPath))
}

const typeDefs = loadSchemaFromDir(schemaPath)

export default typeDefs

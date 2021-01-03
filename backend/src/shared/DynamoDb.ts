import { DynamoDB, Endpoint } from 'aws-sdk'

export class ProductionDynamoDBClient extends DynamoDB {}

export class LocalDynamoDBClient extends DynamoDB {
    constructor(options?: DynamoDB.ClientConfiguration) {
        super({
            region: process.env.AWS_DEFAULT_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
            },
            endpoint: new Endpoint(process.env.DYNAMODB_ENDPOINT ?? ''),
            ...options,
        })
    }
}

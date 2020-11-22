import { DynamoDB, Endpoint } from 'aws-sdk'

const dynamoDb = new DynamoDB({
    region: process.env.DYNAMODB_REGION,
    credentials: {
        accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY ?? '',
    },
    endpoint: new Endpoint(process.env.DYNAMODB_ENDPOINT ?? ''),
})

export default new DynamoDB.DocumentClient({
    service: dynamoDb,
})

const backoffInterval = 5000 // 5 seconds
export const waitForTable = (TableName: string) =>
    dynamoDb
        .describeTable({ TableName })
        .promise()
        .then((data) => {
            if (data.Table?.TableStatus !== 'ACTIVE') {
                console.log(
                    `Table status: ${data.Table?.TableStatus}, retrying in ${backoffInterval}ms...`
                )
                return new Promise((resolve) => {
                    setTimeout(
                        () => waitForTable(TableName).then(resolve),
                        backoffInterval
                    )
                })
            } else {
                return
            }
        })
        .catch((error) => {
            console.warn(
                `Table not found! Error below. Retrying in ${backoffInterval} ms...`,
                error
            )
            return new Promise((resolve) => {
                setTimeout(
                    () => waitForTable(TableName).then(resolve),
                    backoffInterval
                )
            })
        })

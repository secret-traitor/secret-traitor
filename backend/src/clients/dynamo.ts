import AWS, { DynamoDB, Endpoint } from 'aws-sdk'
import { GameStatus, GameType } from '@entities/Game'

AWS.config.update({
    region: 'local',
    credentials: {
        accessKeyId: 'qal9pj',
        secretAccessKey: 'qryy0m',
    },
})

export const dynamoDb = new DynamoDB({
    endpoint: new Endpoint('http://localhost:8000'),
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

const dynamoDbDocClient = new DynamoDB.DocumentClient({ service: dynamoDb })

export default dynamoDbDocClient

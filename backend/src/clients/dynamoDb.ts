import { DynamoDB } from 'aws-sdk'

import * as env from 'src/shared/config'
import logger from 'src/shared/Logger'
import {
    LocalDynamoDBClient,
    ProductionDynamoDBClient,
} from 'src/shared/DynamoDb'

const dynamoDb =
    env.NODE_ENV === 'production'
        ? new ProductionDynamoDBClient()
        : new LocalDynamoDBClient()

const dynamoDocClient = new DynamoDB.DocumentClient({
    service: dynamoDb,
})

export default dynamoDocClient

const backoffInterval = 5000 // 5 seconds
export const waitForTable = (TableName: string) =>
    dynamoDb
        .describeTable({ TableName })
        .promise()
        .then((data) => {
            if (data.Table?.TableStatus !== 'ACTIVE') {
                logger.info(
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
            logger.warn(
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

type Item = { [key: string]: any }

type PutArgs = {
    Item: Item
    TableName: string
}

export const put = async ({ Item, TableName }: PutArgs) =>
    await dynamoDocClient.put({ TableName, Item }).promise()

type PutManyArgs = {
    Items: Item[]
    TableName: string
}

export const putMany = async ({ Items, TableName }: PutManyArgs) =>
    await dynamoDocClient
        .batchWrite({
            RequestItems: {
                [TableName]: Items.map((Item) => ({
                    PutRequest: { Item },
                })),
            },
        })
        .promise()

type FindArgs = {
    EntityType: string
    ScanFilter: { [key: string]: Condition }
    TableName: string
}

export const scan = async ({ EntityType, ScanFilter, TableName }: FindArgs) =>
    await dynamoDocClient
        .scan({
            TableName,
            ScanFilter: {
                ...ScanFilter,
                EntityType: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [EntityType],
                },
            },
        })
        .promise()

export type ComparisonOperator =
    | 'EQ'
    | 'NE'
    | 'IN'
    | 'LE'
    | 'LT'
    | 'GE'
    | 'GT'
    | 'BETWEEN'
    | 'NOT_NULL'
    | 'NULL'
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'BEGINS_WITH'

export type Condition = {
    AttributeValueList?: any
    ComparisonOperator: ComparisonOperator
}

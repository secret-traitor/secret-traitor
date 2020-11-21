import { DynamoDB, Endpoint } from 'aws-sdk'

const dynamoDb = new DynamoDB({
    region: 'local',
    credentials: {
        accessKeyId: 'qal9pj',
        secretAccessKey: 'qryy0m',
    },
    endpoint: new Endpoint('http://localhost:8000'),
})

export default new DynamoDB.DocumentClient({ service: dynamoDb })

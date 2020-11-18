import AWS from 'aws-sdk'

AWS.config.update({
    region: 'us-west-2',
    dynamodb: {
        endpoint: new AWS.Endpoint(process.env.DYNAMO_HOST ?? 'localhost:8000'),
    },
})

const dynamodb = new AWS.DynamoDB.DocumentClient()

export default dynamodb

import * as acm from '@aws-cdk/aws-certificatemanager'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as cdk from '@aws-cdk/core'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda'
import * as route53 from '@aws-cdk/aws-route53'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'
import * as targets from '@aws-cdk/aws-route53-targets'

import { HitCounter } from './hitcounter'

export class SecretTraitorStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        ///////////// ACTUAL SECRET TRAITOR RESOURCES /////////////
        const table = new dynamodb.Table(this, 'Games', {
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
        })

        // API Gateway REST API with the GraphQL API
        const graphQLLambda = new lambda.Function(this, 'GraphQLHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.httpHandler',
            code: lambda.Code.fromAsset('../backend/dist'),
            environment: {
                GAMES_TABLE_NAME: table.tableName,
                NODE_ENV: 'production',
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 3008,
        })

        const graphQLAPI = new apigw.LambdaRestApi(this, 'GraphQLAPI', {
            handler: graphQLLambda,
        })

        table.grantReadWriteData(graphQLLambda)
        table.grant(graphQLLambda, 'dynamodb:DescribeTable')

        // S3 bucket with the frontend assets
        const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            websiteIndexDocument: 'index.html',
        })
        const websiteDeploy = new s3deploy.BucketDeployment(
            this,
            'DeployWebsite',
            {
                sources: [s3deploy.Source.asset('../frontend/build')],
                destinationBucket: websiteBucket,
            }
        )

        // CloudFront distro with default behavior pulling from the S3 bucket,
        // and /graphql pulling from the API Gateway API
        const cloudFrontDistro = new cloudfront.CloudFrontWebDistribution(
            this,
            'WebsiteDistro',
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: websiteBucket,
                        },
                        behaviors: [{ isDefaultBehavior: true }],
                    },
                ],
            }
        )
    }
}

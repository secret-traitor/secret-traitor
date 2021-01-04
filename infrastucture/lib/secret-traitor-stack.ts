import * as apigw from '@aws-cdk/aws-apigateway'
import * as cdk from '@aws-cdk/core'
import { RemovalPolicy } from '@aws-cdk/core'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import { BillingMode } from '@aws-cdk/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'
import * as origins from '@aws-cdk/aws-cloudfront-origins'

export class SecretTraitorStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const GamesTable = new dynamodb.Table(this, 'GamesTable', {
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        })
        new cdk.CfnOutput(this, 'GamesTableArn', {
            value: GamesTable.tableArn,
        })
        new cdk.CfnOutput(this, 'GamesTableName', {
            value: GamesTable.tableName,
        })

        // API Gateway REST API with the GraphQL API
        const HttpLambdaFunction = new lambda.Function(
            this,
            'HttpLambdaFunction',
            {
                runtime: lambda.Runtime.NODEJS_12_X,
                handler: 'lambda.httpHandler',
                code: lambda.Code.fromAsset('../backend/dist'),
                environment: {
                    GAMES_TABLE_NAME: GamesTable.tableName,
                    NODE_ENV: 'production',
                },
                timeout: cdk.Duration.seconds(30),
                memorySize: 3008,
            }
        )
        new cdk.CfnOutput(this, 'HttpLambdaFunctionArn', {
            value: HttpLambdaFunction.functionArn,
        })
        new cdk.CfnOutput(this, 'HttpLambdaFunctionName', {
            value: HttpLambdaFunction.functionName,
        })
        const HttpLambdaApi = new apigw.LambdaRestApi(this, 'HttpLambdaApi', {
            handler: HttpLambdaFunction,
        })
        new cdk.CfnOutput(this, 'HttpLambdaApiId', {
            value: HttpLambdaApi.restApiId,
        })
        new cdk.CfnOutput(this, 'HttpLambdaApiUrl', {
            value: HttpLambdaApi.url,
        })

        GamesTable.grantReadWriteData(HttpLambdaFunction)

        // S3 bucket with the frontend assets
        const WebsiteBucket = new s3.Bucket(this, 'WebsiteBucket')
        new cdk.CfnOutput(this, 'WebsiteBucketArn', {
            value: WebsiteBucket.bucketArn,
        })
        new cdk.CfnOutput(this, 'WebsiteBucketDomainName', {
            value: WebsiteBucket.bucketDomainName,
        })
        new cdk.CfnOutput(this, 'WebsiteBucketName', {
            value: WebsiteBucket.bucketName,
        })
        const WebsiteBucketDeployment = new s3deploy.BucketDeployment(
            this,
            'WebsiteBucketDeployment',
            {
                sources: [s3deploy.Source.asset('../frontend/build')],
                destinationBucket: WebsiteBucket,
            }
        )

        // CloudFront distro with default behavior pulling from the S3 bucket,
        // and /graphql pulling from the API Gateway API
        const WebDistribution = new cloudfront.CloudFrontWebDistribution(
            this,
            'WebDistribution',
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: WebsiteBucket,
                        },
                        behaviors: [{ isDefaultBehavior: true }],
                    },
                ],
            }
        )
        new cdk.CfnOutput(this, 'WebDistributionDomainName', {
            value: WebDistribution.distributionDomainName,
        })
        new cdk.CfnOutput(this, 'WebDistributionId', {
            value: WebDistribution.distributionId,
        })

        const httpLambdaApiDomainName = `${HttpLambdaApi.restApiId}.execute-api.${this.region}.${this.urlSuffix}`
        const Distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: { origin: new origins.S3Origin(WebsiteBucket) },
            defaultRootObject: 'index.html',
            additionalBehaviors: {
                '/prod/*': {
                    origin: new origins.HttpOrigin(httpLambdaApiDomainName, {
                        protocolPolicy:
                            cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                    }),
                },
            },
        })
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: Distribution.distributionDomainName,
        })
        new cdk.CfnOutput(this, 'DistributionName', {
            value: Distribution.domainName,
        })
    }
}

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

        const table = new dynamodb.Table(this, 'Table', {
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        })
        new cdk.CfnOutput(this, 'TableArn', {
            value: table.tableArn,
        })
        new cdk.CfnOutput(this, 'TableName', {
            value: table.tableName,
        })

        // API Gateway REST API with the GraphQL API
        const httpLambda = new lambda.Function(this, 'HttpLambdaFunction', {
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
        new cdk.CfnOutput(this, 'HttpLambdaFunctionArn', {
            value: httpLambda.functionArn,
        })
        new cdk.CfnOutput(this, 'HttpLambdaFunctionName', {
            value: httpLambda.functionName,
        })
        const httpLambdaApi = new apigw.LambdaRestApi(this, 'HttpLambdaApi', {
            handler: httpLambda,
        })
        new cdk.CfnOutput(this, 'HttpLambdaApiId', {
            value: httpLambdaApi.restApiId,
        })
        new cdk.CfnOutput(this, 'HttpLambdaApiUrl', {
            value: httpLambdaApi.url,
        })

        table.grantReadWriteData(httpLambda)

        // S3 bucket with the frontend assets
        const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            websiteIndexDocument: 'index.html',
        })
        new cdk.CfnOutput(this, 'WebsiteBucketArn', {
            value: websiteBucket.bucketArn,
        })
        new cdk.CfnOutput(this, 'WebsiteBucketDomainName', {
            value: websiteBucket.bucketDomainName,
        })
        new cdk.CfnOutput(this, 'WebsiteBucketName', {
            value: websiteBucket.bucketName,
        })
        const websiteBucketDeployment = new s3deploy.BucketDeployment(
            this,
            'WebsiteBucketDeployment',
            {
                sources: [s3deploy.Source.asset('../frontend/build')],
                destinationBucket: websiteBucket,
            }
        )
        new cdk.CfnOutput(this, 'WebsiteBucketDeploymentNodeId', {
            value: websiteBucketDeployment.node.id,
        })

        // CloudFront distro with default behavior pulling from the S3 bucket,
        // and /graphql pulling from the API Gateway API
        const webDistribution = new cloudfront.CloudFrontWebDistribution(
            this,
            'WebDistribution',
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
        new cdk.CfnOutput(this, 'WebDistributionDomainName', {
            value: webDistribution.distributionDomainName,
        })
        new cdk.CfnOutput(this, 'WebDistributionId', {
            value: webDistribution.distributionId,
        })

        const httpLambdaApiDomainName = `${httpLambdaApi.restApiId}.execute-api.${this.region}.${this.urlSuffix}`
        const distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: { origin: new origins.S3Origin(websiteBucket) },
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
            value: distribution.distributionDomainName,
        })
        new cdk.CfnOutput(this, 'DistributionName', {
            value: distribution.domainName,
        })
    }
}

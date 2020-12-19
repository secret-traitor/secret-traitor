import * as acm from '@aws-cdk/aws-certificatemanager'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda'
import * as route53 from '@aws-cdk/aws-route53'
import * as targets from '@aws-cdk/aws-route53-targets'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'

import { HitCounter } from './hitcounter'

export class SecretTraitorStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const zoneName = this.node.tryGetContext('domain') as string
        const appDescriptor = this.node.tryGetContext('appDescriptor') as string
        const graphqlSubdomain = this.node.tryGetContext(
            'graphqlSubdomain'
        ) as string

        const hostedZone = route53.HostedZone.fromLookup(
            this,
            `${appDescriptor}Zone`,
            { domainName: zoneName }
        )

        const certificate = new acm.Certificate(this, 'Certificate', {
            domainName: zoneName,
            subjectAlternativeNames: [
                `*.${zoneName}`,
                `${graphqlSubdomain}.${zoneName}`,
                `www.${zoneName}`,
            ],
            validation: acm.CertificateValidation.fromDns(hostedZone),
        })

        const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {})

        // define an API Gateway REST API resource backed by our "helloWithCounter" function.
        const lambdaApi = new apigw.LambdaRestApi(this, 'Endpoint', {
            handler: helloWithCounter.handler,
        })

        // const graphqlApi =

        const apigwDomainName = new apigw.DomainName(
            this,
            'GraphQLDomainName',
            {
                domainName: `${graphqlSubdomain}.${zoneName}`,
                certificate,
                endpointType: apigw.EndpointType.EDGE,
                securityPolicy: apigw.SecurityPolicy.TLS_1_2,
            }
        )
        apigwDomainName.addBasePathMapping(lambdaApi)
        new route53.ARecord(this, 'GraphQLAlias', {
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(
                new targets.ApiGatewayDomain(apigwDomainName)
            ),
            recordName: `${graphqlSubdomain}`,
        })

        const apigwHitCounterDomainName = new apigw.DomainName(
            this,
            'HitCounterDomainName',
            {
                domainName: `hitc.${zoneName}`,
                certificate,
                endpointType: apigw.EndpointType.EDGE,
                securityPolicy: apigw.SecurityPolicy.TLS_1_2,
            }
        )
        apigwHitCounterDomainName.addBasePathMapping(lambdaApi)
        new route53.ARecord(this, 'HitCounterAlias', {
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(
                new targets.ApiGatewayDomain(apigwHitCounterDomainName)
            ),
            recordName: `hitc`,
        })

        new route53.TxtRecord(this, 'Txt3Record', {
            zone: hostedZone,
            values: ['fromTemplate,Txt3'],
            recordName: 'txt3',
        })

        ///////////// ACTUAL SECRET TRAITOR RESOURCES /////////////
        const table = new dynamodb.Table(this, 'Games', {
            tableName: 'Games',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
        })

        // API Gateway REST API with the GraphQL API
        const graphQLLambda = new lambda.Function(this, 'GraphQLHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'lambda.httpHandler',
            code: lambda.Code.fromAsset('../backend/dist'),
            environment: {
                ENV_VAR_X: process.env.ENV_VAR_X || 'default-value-x',
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
            websiteIndexDocument: 'index.html',
            publicReadAccess: true,
        })

        const websiteDeploy = new s3deploy.BucketDeployment(
            this,
            'DeployWebsite',
            {
                sources: [s3deploy.Source.asset('../frontend/dist')],
                destinationBucket: websiteBucket,
            }
        )

        // CloudFront distro with default behavior pulling from the S3 bucket,
        // and /graphql pulling from the API Gateway API
    }
}

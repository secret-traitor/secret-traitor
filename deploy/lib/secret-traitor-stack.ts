import * as acm from '@aws-cdk/aws-certificatemanager'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda'
import * as route53 from '@aws-cdk/aws-route53'
import * as targets from '@aws-cdk/aws-route53-targets'
import * as events from '@aws-cdk/aws-events'
import * as iam from '@aws-cdk/aws-iam'
import * as eventTargets from '@aws-cdk/aws-events-targets'
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
        // API Gateway REST API with the GraphQL API
        const HttpHandler = new lambda.Function(this, 'HttpHandler', {
            code: lambda.Code.fromAsset('../backend/dist'),
            environment: { NODE_ENV: 'production' },
            handler: 'lambda.httpHandler',
            memorySize: 512,
            runtime: lambda.Runtime.NODEJS_12_X,
            timeout: cdk.Duration.seconds(30),
        })
        const httpEvent = new events.Rule(this, 'http', {})
        const RestApi = new apigw.LambdaRestApi(this, 'RestApi', {
            handler: HttpHandler,
        })

        const WebsocketHandler = new lambda.Function(this, 'WebSocketHandler', {
            code: lambda.Code.fromAsset('../backend/dist'),
            environment: { NODE_ENV: 'production' },
            handler: 'lambda.webSocketHandler',
            memorySize: 512,
            runtime: lambda.Runtime.NODEJS_12_X,
            timeout: cdk.Duration.seconds(30),
        })
        const WebsocketPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [WebsocketHandler.functionArn],
            actions: ['lambda:InvokeFunction'],
        })
        const WebsocketRole = new iam.Role(this, 'WebsocketRole', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        })
        WebsocketRole.addToPolicy(WebsocketPolicy)

        const ConnectionsTable = new dynamodb.Table(this, 'Connections', {
            tableName: 'Connections',
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })
        ConnectionsTable.grantReadWriteData(HttpHandler)
        ConnectionsTable.grant(HttpHandler, 'dynamodb:DescribeTable')

        const SubscriptionsTable = new dynamodb.Table(this, 'Subscriptions', {
            tableName: 'Subscriptions',
            partitionKey: {
                name: 'event',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'subscriptionId',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })
        SubscriptionsTable.grantReadWriteData(HttpHandler)
        SubscriptionsTable.grant(HttpHandler, 'dynamodb:DescribeTable')

        const GamesTable = new dynamodb.Table(this, 'Games', {
            tableName: 'Games',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })
        GamesTable.grantReadWriteData(HttpHandler)
        GamesTable.grant(HttpHandler, 'dynamodb:DescribeTable')

        // S3 bucket with the frontend assets

        // CloudFront distro with default behavior pulling from the S3 bucket,
        // and /graphql pulling from the API Gateway API
    }
}

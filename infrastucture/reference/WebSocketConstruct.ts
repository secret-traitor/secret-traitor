/* tslint:disable */
/* eslint-disable */
//==============================================================
// This file was pulled from a github comment. It should not be edited
// and is intended to be used as a reference.
//
// source:
// https://github.com/aws/aws-cdk/issues/2872#issuecomment-736544889
//==============================================================

import * as path from 'path'
import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2'
import * as alias from '@aws-cdk/aws-route53-targets'
import * as route53 from '@aws-cdk/aws-route53'
import * as lambda from '@aws-cdk/aws-lambda'
import * as logs from '@aws-cdk/aws-logs'
import * as iam from '@aws-cdk/aws-iam'

//==============================================================
// This section has been modified from its original source.
//
// original:
// import * as Index from '../../constants/secondary-indexes'
//
// modified:
const Index = {
    names: {
        conn_table: {
            conn_by_conn_id: undefined,
            conn_by_user_id: undefined,
            conn_by_ip_addr: undefined,
        },
    },
    keys: {
        conn_table: {
            conn_by_conn_id_sk: undefined,
            conn_by_user_id_sk: undefined,
            conn_by_ip_addr_sk: undefined,
        },
    },
}
//==============================================================

export interface Props {
    prefix: string
    region: string
    account_id: string
    cert_arn?: string
    site_domain_name?: string
    wss_domain_name?: string
    environment?: Record<string, string>
}

/**
 * Websocket API composed from L1 constructs since
 * aws has yet to release any L2 constructs.
 */
export class WebSocketConstruct extends cdk.Construct {
    public readonly connect_fn: lambda.Function
    public readonly disconnect_fn: lambda.Function
    public readonly message_fn: lambda.Function
    /** role needed to send messages to websocket clients */
    public readonly apigw_role: iam.Role
    public readonly CONN_TABLE_NAME: string
    private connection_table: dynamodb.Table

    constructor(parent: cdk.Construct, id: string, props: Props) {
        super(parent, id)

        const route_selection_key = 'action'
        const route_selection_value = 'sendmessage'

        // table where websocket connections will be stored
        const websocket_table = new dynamodb.Table(this, 'connections', {
            tableName: props?.prefix + 'connections',
            partitionKey: {
                name: 'room_id',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'connection_id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            pointInTimeRecovery: true,
            writeCapacity: 5,
            readCapacity: 5,
        })

        websocket_table.addGlobalSecondaryIndex({
            indexName: Index.names.conn_table.conn_by_conn_id,
            partitionKey: {
                name: Index.keys.conn_table.conn_by_conn_id_sk,
                type: dynamodb.AttributeType.STRING,
            },
        })

        websocket_table.addGlobalSecondaryIndex({
            indexName: Index.names.conn_table.conn_by_user_id,
            partitionKey: {
                name: Index.keys.conn_table.conn_by_user_id_sk,
                type: dynamodb.AttributeType.STRING,
            },
        })

        websocket_table.addGlobalSecondaryIndex({
            indexName: Index.names.conn_table.conn_by_ip_addr,
            partitionKey: {
                name: Index.keys.conn_table.conn_by_ip_addr_sk,
                type: dynamodb.AttributeType.STRING,
            },
        })

        this.CONN_TABLE_NAME = websocket_table.tableName

        // initialize api
        const name = id + '-api'
        const websocket_api = new apigwv2.CfnApi(this, name, {
            name: 'websockets',
            protocolType: 'WEBSOCKET',
            routeSelectionExpression: `$request.body.${route_selection_key}`,
            // basePath: "v1",
        })

        const base_permissions = websocket_table.tableArn
        const index_permissions = `${base_permissions}/index/*`

        // initialize lambda and permissions
        const lambda_policy = new iam.PolicyStatement({
            // "dynamodb:*" also works here
            actions: [
                'dynamodb:GetItem',
                'dynamodb:DeleteItem',
                'dynamodb:PutItem',
                'dynamodb:Scan',
                'dynamodb:Query',
                'dynamodb:UpdateItem',
                'dynamodb:BatchWriteItem',
                'dynamodb:BatchGetItem',
                'dynamodb:DescribeTable',
                'dynamodb:ConditionCheckItem',
            ],
            resources: [base_permissions, index_permissions],
        })

        const connect_lambda_role = new iam.Role(this, 'connect-lambda-role', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        })
        connect_lambda_role.addToPolicy(lambda_policy)
        connect_lambda_role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSLambdaBasicExecutionRole'
            )
        )

        const disconnect_lambda_role = new iam.Role(
            this,
            'disconnect-lambda-role',
            { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') }
        )
        disconnect_lambda_role.addToPolicy(lambda_policy)
        disconnect_lambda_role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSLambdaBasicExecutionRole'
            )
        )

        const message_lambda_role = new iam.Role(this, 'message-lambda-role', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        })
        message_lambda_role.addToPolicy(lambda_policy)
        message_lambda_role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                'service-role/AWSLambdaBasicExecutionRole'
            )
        )

        const resource_str = this.create_resource_str(
            props.account_id,
            props.region,
            websocket_api.ref
        )

        const execute_apigw_policy = [
            new iam.PolicyStatement({
                actions: [
                    'execute-api:Invoke',
                    'execute-api:ManageConnections',
                ],
                resources: [resource_str],
                effect: iam.Effect.ALLOW,
            }),
        ]

        const connect_lambda = new lambda.Function(this, 'connect_lambda', {
            handler: 'index.handler',
            functionName: props?.prefix + 'connect',
            description: 'Connect a user.',
            timeout: cdk.Duration.seconds(300),
            code: lambda.Code.fromAsset(
                path.join(__dirname, '../..', '/dist/onconnect')
            ),
            runtime: lambda.Runtime.NODEJS_12_X,
            logRetention: logs.RetentionDays.FIVE_DAYS,
            role: connect_lambda_role,
            environment: {
                ...props.environment,
                CONN_TABLE_NAME: websocket_table.tableName,
            },
        })

        const disconnect_lambda = new lambda.Function(
            this,
            'disconnect_lambda',
            {
                handler: 'index.handler',
                functionName: props?.prefix + 'disconnect',
                description: 'Disconnect a user.',
                timeout: cdk.Duration.seconds(300),
                code: lambda.Code.fromAsset(
                    path.join(__dirname, '../..', '/dist/ondisconnect')
                ),
                runtime: lambda.Runtime.NODEJS_12_X,
                logRetention: logs.RetentionDays.FIVE_DAYS,
                role: disconnect_lambda_role,
                environment: {
                    ...props.environment,
                    CONN_TABLE_NAME: websocket_table.tableName,
                },
            }
        )

        const message_lambda = new lambda.Function(this, 'message-lambda', {
            handler: 'index.handler',
            functionName: props?.prefix + 'send-message',
            description: 'Send a message to all connected clients.',
            timeout: cdk.Duration.seconds(300),
            code: lambda.Code.fromAsset(
                path.join(__dirname, '../..', '/dist/send-message')
            ),
            runtime: lambda.Runtime.NODEJS_12_X,
            logRetention: logs.RetentionDays.FIVE_DAYS,
            role: message_lambda_role,
            initialPolicy: execute_apigw_policy,
            environment: {
                CONN_TABLE_NAME: websocket_table.tableName,
                ...props.environment,
            },
        })

        // access role for the socket api to access the socket lambda
        const policy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [
                connect_lambda.functionArn,
                disconnect_lambda.functionArn,
                message_lambda.functionArn,
            ],
            actions: ['lambda:InvokeFunction'],
        })

        const role = new iam.Role(this, `${name}-iam-role`, {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        })
        role.addToPolicy(policy)

        // websocket api lambda integration
        const connect_integration = new apigwv2.CfnIntegration(
            this,
            'connect-lambda-integration',
            {
                apiId: websocket_api.ref,
                integrationType: 'AWS_PROXY',
                integrationUri: this.create_integration_str(
                    props.region,
                    connect_lambda.functionArn
                ),
                credentialsArn: role.roleArn,
            }
        )

        const disconnect_integration = new apigwv2.CfnIntegration(
            this,
            'disconnect-lambda-integration',
            {
                apiId: websocket_api.ref,
                integrationType: 'AWS_PROXY',
                integrationUri: this.create_integration_str(
                    props.region,
                    disconnect_lambda.functionArn
                ),
                credentialsArn: role.roleArn,
            }
        )

        const message_integration = new apigwv2.CfnIntegration(
            this,
            'message-lambda-integration',
            {
                apiId: websocket_api.ref,
                integrationType: 'AWS_PROXY',
                integrationUri: this.create_integration_str(
                    props.region,
                    message_lambda.functionArn
                ),
                credentialsArn: role.roleArn,
            }
        )

        // Example route definition
        const connect_route = new apigwv2.CfnRoute(this, 'connect-route', {
            apiId: websocket_api.ref,
            routeKey: '$connect',
            authorizationType: 'NONE',
            target: 'integrations/' + connect_integration.ref,
        })

        const disconnect_route = new apigwv2.CfnRoute(
            this,
            'disconnect-route',
            {
                apiId: websocket_api.ref,
                routeKey: '$disconnect',
                authorizationType: 'NONE',
                target: 'integrations/' + disconnect_integration.ref,
            }
        )

        /**
         * On the client, you must send messages in the following way:
         * JSON.stringify({ "action": "sendmessage", "data": "hello world" })
         */
        const message_route = new apigwv2.CfnRoute(this, 'message-route', {
            apiId: websocket_api.ref,
            routeKey: route_selection_value,
            authorizationType: 'NONE',
            target: 'integrations/' + message_integration.ref,
        })

        // allow other other tables to grant permissions to these lambdas
        this.connect_fn = connect_lambda
        this.disconnect_fn = disconnect_lambda
        this.message_fn = message_lambda
        this.connection_table = websocket_table
        this.apigw_role = message_lambda_role

        // deployment
        const apigw_wss_deployment = new apigwv2.CfnDeployment(
            this,
            'apigw-deployment',
            { apiId: websocket_api.ref }
        )

        // stage
        const apigw_wss_stage = new apigwv2.CfnStage(this, 'apigw-stage', {
            apiId: websocket_api.ref,
            autoDeploy: true,
            deploymentId: apigw_wss_deployment.ref,
            stageName: 'v1',
            defaultRouteSettings: {
                throttlingBurstLimit: 500,
                throttlingRateLimit: 1000,
            },
        })

        // custom api domain
        const has_necessary_domains =
            props.site_domain_name && props.wss_domain_name && props.cert_arn

        // CUSTOM API DOMAIN ------------------------------------------------------------------
        if (has_necessary_domains) {
            const hosted_zone = route53.HostedZone.fromLookup(
                this,
                'hosted-zone',
                {
                    domainName: props.site_domain_name!,
                }
            )

            // custom domain
            const apigw_domain_socket = new apigwv2.CfnDomainName(
                this,
                'apigw-domain-socket',
                {
                    domainName: props.wss_domain_name!,
                    domainNameConfigurations: [
                        {
                            certificateArn: props.cert_arn,
                            endpointType: apigw.EndpointType.REGIONAL,
                        },
                    ],
                }
            )

            new apigwv2.CfnApiMapping(this, 'apigw-mapping-socket', {
                domainName: apigw_domain_socket.ref,
                apiId: websocket_api.ref,
                stage: apigw_wss_stage.ref,
            })

            // create the subdomain
            new route53.CnameRecord(this, 'route-53-socket', {
                recordName: props.wss_domain_name,
                zone: hosted_zone,
                domainName: apigw_domain_socket.attrRegionalDomainName,
            })
        }

        // all routes are dependencies of the deployment
        const routes = new cdk.ConcreteDependable()
        routes.add(connect_route)
        routes.add(disconnect_route)
        routes.add(message_route)

        // add the dependency
        apigw_wss_deployment.node.addDependency(routes)
    }

    private create_integration_str = (region: string, fn_arn: string): string =>
        `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${fn_arn}/invocations`

    private create_resource_str = (
        account_id: string,
        region: string,
        ref: string
    ): string => `arn:aws:execute-api:${region}:${account_id}:${ref}/*`

    public grant_read_write = (lambda: lambda.Function) =>
        this.connection_table.grantReadWriteData(lambda)
}

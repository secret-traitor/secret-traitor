import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as acm from "@aws-cdk/aws-certificatemanager";
import { HitCounter } from "./hitcounter";
import { domain } from "process";

export class SecretTraitorStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zoneName = this.node.tryGetContext("domain") as string;
    const appDescriptor = this.node.tryGetContext("appDescriptor") as string;
    const graphqlSubdomainDomain = this.node.tryGetContext(
      "graphqlSubdomainDomain"
    ) as string;

    // const hostedZone = new route53.HostedZone(this, `${appDescriptor}Zone`, {
    //   zoneName,
    // });
    // const hostedZoneResource = hostedZone.node.findChild(
    //   "Resource"
    // ) as cdk.CfnResource;
    // hostedZoneResource.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    const hostedZone = route53.HostedZone.fromLookup(
      this,
      `${appDescriptor}Zone`,
      { domainName: zoneName }
    );

    // const zone2 = route53.HostedZone.fromLookup(this, "Zone2", {
    //   domainName: "pssvr.com",
    // });

    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: zoneName,
      subjectAlternativeNames: [
        `*.${zoneName}`,
        `${graphqlSubdomainDomain}.${zoneName}`,
        `www.${zoneName}`,
      ],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // define an AWS lambda resource
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "hello.handler", // file is "hello", function is "handler"
      timeout: cdk.Duration.seconds(20),
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    // define an API Gateway REST API resource backed by our "helloWithCounter" function.
    const lambdaApi = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });

    const apigwDomainName = new apigw.DomainName(this, "GraphQLDomainName", {
      domainName: `${graphqlSubdomainDomain}.${zoneName}`,
      certificate,
      endpointType: apigw.EndpointType.EDGE,
      securityPolicy: apigw.SecurityPolicy.TLS_1_2,
    });
    apigwDomainName.addBasePathMapping(lambdaApi);
    new route53.ARecord(this, "GraphQLAlias", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayDomain(apigwDomainName)
      ),
      recordName: `${graphqlSubdomainDomain}`,
    });

    const apigwHitCounterDomainName = new apigw.DomainName(
      this,
      "HitCounterDomainName",
      {
        domainName: `hitc.${zoneName}`,
        certificate,
        endpointType: apigw.EndpointType.EDGE,
        securityPolicy: apigw.SecurityPolicy.TLS_1_2,
      }
    );
    apigwHitCounterDomainName.addBasePathMapping(lambdaApi);
    new route53.ARecord(this, "HitCounterAlias", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayDomain(apigwHitCounterDomainName)
      ),
      recordName: `hitc`,
    });

    new route53.TxtRecord(this, "Txt3Record", {
      zone: hostedZone,
      values: ["fromTemplate,Txt3"],
      recordName: "txt3",
    });
  }
}

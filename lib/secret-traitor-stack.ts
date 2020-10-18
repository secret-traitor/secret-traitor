import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as ec2 from "@aws-cdk/aws-ec2";
import { HitCounter } from "./hitcounter";

export class SecretTraitorStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zoneName = this.node.tryGetContext("domain") as string;
    const appDescriptor = this.node.tryGetContext("appDescriptor") as string;
    const graphqlSubdomain = this.node.tryGetContext(
      "graphqlSubdomain"
    ) as string;

    const hostedZone = route53.HostedZone.fromLookup(
      this,
      `${appDescriptor}Zone`,
      { domainName: zoneName }
    );

    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: zoneName,
      subjectAlternativeNames: [
        `*.${zoneName}`,
        `${graphqlSubdomain}.${zoneName}`,
        `www.${zoneName}`,
      ],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {});

    // define an API Gateway REST API resource backed by our "helloWithCounter" function.
    const lambdaApi = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });

    // const graphqlApi =

    const apigwDomainName = new apigw.DomainName(this, "GraphQLDomainName", {
      domainName: `${graphqlSubdomain}.${zoneName}`,
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
      recordName: `${graphqlSubdomain}`,
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

    // example lifted from:
    // https://medium.com/tysonworks/introduction-to-aws-cdk-with-ec2-example-2355505c70b3
    const ec2Vpc = new ec2.Vpc(this, "TestEC2VPC", {
      cidr: "10.0.0.0/16",
      natGateways: 0,
    });
    const awsAMI = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    });
    new ec2.Instance(this, "TestEC2Instance", {
      vpc: ec2Vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.NANO
      ),
      machineImage: awsAMI,
    });
  }
}

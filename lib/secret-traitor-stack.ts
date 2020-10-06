import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as route53 from "@aws-cdk/aws-route53";
import { HitCounter } from "./hitcounter";

export class SecretTraitorStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });

    const hostedZone = new route53.HostedZone(this, "SecretTraitorZone", {
      zoneName: this.node.tryGetContext("domain"),
    });

    new cdk.CfnOutput(this, "HostedZoneNameServers", {
      value:
        (hostedZone.hostedZoneNameServers &&
          hostedZone.hostedZoneNameServers.join(",")) ||
        "",
    });

    new cdk.CfnOutput(this, "TestOutput1", { value: "example-output" });

    const nameServers =
      (hostedZone.hostedZoneNameServers &&
        hostedZone.hostedZoneNameServers.join(",")) ||
      "";

    new cdk.CfnOutput(this, "Out2", {
      value: cdk.Fn.join(",", hostedZone.hostedZoneNameServers || [""]),
    });
  }
}

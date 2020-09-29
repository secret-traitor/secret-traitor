import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
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
  }
}

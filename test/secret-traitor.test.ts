import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as SecretTraitor from "../lib/secret-traitor-stack";

test("Lambda Function Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SecretTraitor.SecretTraitorStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
});

test("DynamoDB Table Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SecretTraitor.SecretTraitorStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
});

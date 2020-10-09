import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as SecretTraitor from "../lib/secret-traitor-stack";

test("placeholder test", () => {
  expect(true).toBe(true);
});

test.skip("Example CDK test, verify Dynamo table created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SecretTraitor.SecretTraitorStack(app, "MyTestStack", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
  // THEN
  expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
});

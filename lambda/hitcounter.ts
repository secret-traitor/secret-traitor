const { DynamoDB, Endpoint, Lambda } = require("aws-sdk");

// the variable SAM_MODE set to this value means that we are running locally
// with AWS's sam cli
const SAM_MODE_LOCAL = "local";
const HITS_TABLE_NAME = "Hits";

exports.handler = async function (event: {
  path: string;
  requestContext: { requestId: string };
}) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients

  const dynamo =
    process.env.SAM_MODE && process.env.SAM_MODE === SAM_MODE_LOCAL
      ? new DynamoDB({
          // modified for local
          endpoint: new Endpoint("http://dynamodb:8000/"), // modified for local
        })
      : new DynamoDB(); // modified for local
  const dynamoDocClient = new DynamoDB.DocumentClient({ service: dynamo });
  const lambda = new Lambda();
  console.log(`1: executing..., request ${event.requestContext?.requestId}`);
  // console.log(event);

  // update dynamo entry for "path" with hits++
  await dynamo
    .updateItem(
      {
        TableName:
          process.env.SAM_MODE && process.env.SAM_MODE === SAM_MODE_LOCAL
            ? HITS_TABLE_NAME
            : process.env.HITS_TABLE_NAME,
        Key: { path: { S: event.path } },
        UpdateExpression: "ADD hits :incr",
        ExpressionAttributeValues: { ":incr": { N: "1" } },
      },
      function (err: { stack: any }, data: any) {
        if (err) {
          console.log("dynamodb error!!!!");
          console.log(err, err.stack);
        }
        // an error occurred
        else {
          console.log("***data from dynamo:");
          console.log(data);
        } // successful response
      }
    )
    .promise();

  const updateResponse = await new Promise((resolve, reject) => {
    dynamo.updateItem(
      {
        TableName:
          process.env.SAM_MODE && process.env.SAM_MODE === SAM_MODE_LOCAL
            ? HITS_TABLE_NAME
            : process.env.HITS_TABLE_NAME,
        Key: { path: { S: event.path } },
        UpdateExpression: "ADD hits2 :incr",
        ExpressionAttributeValues: { ":incr": { N: "1" } },
      },
      (err: any, data: any) => {
        resolve({ err: err, data: data });
      }
    );
  });

  console.log("4: updateResponse:");
  console.log(updateResponse);

  console.log("MY_VAR_X:");
  console.log(process.env.MY_VAR_X);

  // call downstream function and capture response
  // const resp = await lambda
  //   .invoke({
  //     FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
  //     Payload: JSON.stringify(event),
  //   })
  //   .promise();

  // console.log("downstream response:", JSON.stringify(resp, undefined, 2));

  // // return response back to upstream caller
  // return JSON.parse(resp.Payload);
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello! You have hit the path ${event.path}\n`,
  };
};

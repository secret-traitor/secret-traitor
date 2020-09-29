const { DynamoDB, Endpoint, Lambda } = require("aws-sdk");

exports.handler = async function (event: { path: string }) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB({
    // modified for local
    endpoint: new Endpoint("http://dynamodb:8000/"), // modified for local
  }); // modified for local
  const lambda = new Lambda();
  console.log("1: executing...");

  await dynamo
    .listTables({}, function (err: { stack: any }, data: any) {
      if (err) {
        console.log("dynamodb listTables error!!!!");
        console.log(err, err.stack);
      }
      // an error occurred
      else console.log(data); // successful response
    })
    .promise();

  // update dynamo entry for "path" with hits++
  await dynamo
    .updateItem(
      {
        TableName: "Hits" /*process.env.HITS_TABLE_NAME*/,
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
    body: `Hello, CDK! You have hit ${event.path}\n`,
  };
};

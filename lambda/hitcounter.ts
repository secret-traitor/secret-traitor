const { DynamoDB, Endpoint, Lambda } = require("aws-sdk");

exports.handler = async function (event: {
  path: string;
  requestContext: { requestId: string };
}) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB({
    // modified for local
    endpoint: new Endpoint("http://dynamodb:8000/"), // modified for local
  }); // modified for local
  const dynamoDocClient = new DynamoDB.DocumentClient({ service: dynamo });
  const lambda = new Lambda();
  console.log(`1: executing..., request ${event.requestContext?.requestId}`);
  // console.log(event);

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

  // const listTablesResponse =

  // const dbResponse = await new Promise((resolve, reject) => {
  //   dynamoDocClient.query(res.locals[paramsName], (err, data) => {
  //     resolve({err: err, data: data});
  //   });
  // });

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

  const updateResponse = await new Promise((resolve, reject) => {
    dynamo.updateItem(
      {
        TableName: "Hits" /*process.env.HITS_TABLE_NAME*/,
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
    body: `Hello, CDK! You have hit ${event.path}\n`,
  };
};

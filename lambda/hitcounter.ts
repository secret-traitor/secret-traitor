const { DynamoDB, Endpoint, Lambda } = require("aws-sdk");

// the variable SAM_MODE set to this value means that we are running locally
// with AWS's sam cli
const SAM_MODE_LOCAL = "local";
const HITS_TABLE_NAME = "Hits";

exports.handler = async function (event: {
  path: string;
  requestContext: { requestId: string };
}) {
  const dynamo =
    process.env.SAM_MODE && process.env.SAM_MODE === SAM_MODE_LOCAL
      ? new DynamoDB({
          endpoint: new Endpoint("http://dynamodb:8000/"),
        })
      : new DynamoDB();
  const dynamoDocClient = new DynamoDB.DocumentClient({ service: dynamo });

  const updateResponse = await new Promise((resolve, reject) => {
    dynamo.updateItem(
      {
        TableName:
          process.env.SAM_MODE && process.env.SAM_MODE === SAM_MODE_LOCAL
            ? HITS_TABLE_NAME
            : process.env.HITS_TABLE_NAME,
        Key: { path: { S: event.path } },
        UpdateExpression: "ADD hits :incr",
        ExpressionAttributeValues: { ":incr": { N: "1" } },
      },
      (err: any, data: any) => {
        resolve({ err: err, data: data });
      }
    );
  });

  console.log("updateResponse:");
  console.log(updateResponse);

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello! You have hit the path ${event.path}\n`,
  };
};

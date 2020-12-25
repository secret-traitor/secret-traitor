import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sst from "@serverless-stack/resources";

export default class DynamoDBStack extends sst.Stack {
    constructor(app: sst.App, id: string, props?: sst.StackProps) {
        super(app, id, props);
        const table = new dynamodb.Table(this, "Table", {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            tableName: 'Games',
        });
        new cdk.CfnOutput(this, "TableName", {
            exportName: app.logicalPrefixedName("TableName"),
            value: table.tableName,
        });
        new cdk.CfnOutput(this, "TableArn", {
            exportName: app.logicalPrefixedName("TableArn"),
            value: table.tableArn,
        });
    }
}
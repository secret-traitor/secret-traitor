import * as cdk from '@aws-cdk/core'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'
import * as sst from '@serverless-stack/resources'

export default class S3Stack extends sst.Stack {
    constructor(app: sst.App, id: string, props?: sst.StackProps) {
        super(app, id, props);
        const bucket = new s3.Bucket(this, 'WebsiteBucket', {
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            websiteIndexDocument: 'index.html',
            // cors: [
            //     {
            //         maxAge: 3000,
            //         allowedOrigins: ["*"],
            //         allowedHeaders: ["*"],
            //         allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.HEAD],
            //     },
            // ],
        });
        new cloudfront.CloudFrontWebDistribution(
            this,
            'WebsiteDistro',
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: bucket,
                        },
                        behaviors: [{ isDefaultBehavior: true }],
                    },
                ],
            }
        )
        new s3deploy.BucketDeployment(
            this,
            'DeployWebsite',
            {
                sources: [s3deploy.Source.asset('../frontend/build')],
                destinationBucket: bucket,
            }
        )
        new cdk.CfnOutput(this, "WebsiteBucketName", {
            value: bucket.bucketName,
        });
    }
}
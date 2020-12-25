import * as sst from "@serverless-stack/resources";
import * as route53 from '@aws-cdk/aws-route53'
import * as acm from '@aws-cdk/aws-certificatemanager'

export default class HostingStack extends sst.Stack {
    constructor(app: sst.App, id: string, props?: sst.StackProps) {
        super(app, id, props);
        const zoneName = this.node.tryGetContext('domain')
        const appDescriptor = this.node.tryGetContext('appDescriptor')
        const graphqlSubdomain = this.node.tryGetContext(
            'graphqlSubdomain'
        )
        const hostedZone = route53.HostedZone.fromLookup(
            this,
            `${appDescriptor}Zone`,
            { domainName: zoneName }
        )
        new acm.Certificate(this, 'Certificate', {
            domainName: zoneName,
            subjectAlternativeNames: [
                `*.${zoneName}`,
                `${graphqlSubdomain}.${zoneName}`,
                `www.${zoneName}`,
            ],
            validation: acm.CertificateValidation.fromDns(hostedZone),
        })
        new route53.TxtRecord(this, 'Txt3Record', {
            zone: hostedZone,
            values: ['fromTemplate,Txt3'],
            recordName: 'txt3',
        })
    }
}
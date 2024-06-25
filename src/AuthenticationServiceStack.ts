import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, SecurityPolicy } from 'aws-cdk-lib/aws-apigateway';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { ARecord, HostedZone, NsRecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { KeyGenerator } from './key-generator/KeyGenerator';
import { Statics } from './Statics';
import { TokenFunction } from './token/token-function';
import { JwksFunction } from './well-known/jwks/jwks-function';
import { ConfigFunction } from './well-known/openid-configuration/config-function';

export interface AuthenticationServiceStackProps extends StackProps, Configurable {}

export class AuthenticationServiceStack extends Stack {

  private readonly subdomain: HostedZone;

  constructor(scope: Construct, id: string, props: AuthenticationServiceStackProps) {
    super(scope, id, props);

    Aspects.of(this).add(new PermissionsBoundaryAspect());

    // Setup a subdomain, certificate and REST API Gateway
    this.subdomain = this.createSubdomain(props);
    const api = new RestApi(this, 'api', {
      domainName: {
        domainName: this.subdomain.zoneName,
        securityPolicy: SecurityPolicy.TLS_1_2,
        certificate: this.certificate(this.subdomain),
      },
    });

    new ARecord(this, 'a-record', {
      target: RecordTarget.fromAlias(new ApiGateway(api)),
      zone: this.subdomain,
      comment: 'To api gateway',
    });

    // Example authorization server side (token endpoint, jwks endpoint and openid-configuration endpoint. No authorization endpoint)
    const oauth = api.root.addResource('oauth');
    const wellKnown = oauth.addResource('.well-known');
    const jwksJson = wellKnown.addResource('jwks');
    const openidConfiguration = wellKnown.addResource('openid-configuration');
    const token = oauth.addResource('token');

    token.addMethod('POST', new LambdaIntegration(this.tokenEndpoint()));
    jwksJson.addMethod('GET', new LambdaIntegration(this.jwksEndpoint()));
    openidConfiguration.addMethod('GET', new LambdaIntegration(this.openidConfigurationEndpoint()));


    new KeyGenerator(this, 'key-generation', {
      keyRetention: Duration.days(50),
      renewalSchedule: Schedule.cron({
        minute: '0',
        hour: '3',
        day: '0',
      }),
    });

  }

  tokenEndpoint() {
    const privateKeySecret1Arn = StringParameter.valueForStringParameter(this, Statics.ssmSigningPrivateKeyArn1);
    const privateKeySecret2Arn = StringParameter.valueForStringParameter(this, Statics.ssmSigningPrivateKeyArn2);
    const privateKeySecret1 = Secret.fromSecretAttributes(this, 'signing-private-key-1', {
      secretPartialArn: privateKeySecret1Arn,
    });
    const privateKeySecret2 = Secret.fromSecretAttributes(this, 'signing-private-key-2', {
      secretPartialArn: privateKeySecret2Arn,
    });
    const tokenFunction = new TokenFunction(this, 'tokens', {
      environment: {
        SINGING_PRIVATE_KEY1_ARN: privateKeySecret1Arn,
        SINGING_PRIVATE_KEY2_ARN: privateKeySecret2Arn,
        ISSUER: this.subdomain.zoneName,
      },
    });
    privateKeySecret1.grantRead(tokenFunction);
    privateKeySecret2.grantRead(tokenFunction);
    return tokenFunction;
  }

  jwksEndpoint() {
    const cert1 = StringParameter.fromStringParameterName(this, 'cert1', Statics.ssmSigningCertificate1);
    const cert2 = StringParameter.fromStringParameterName(this, 'cert2', Statics.ssmSigningCertificate2);
    const jwks = new JwksFunction(this, 'jwks', {
      environment: {
        SSM_CERT1: Statics.ssmSigningCertificate1,
        SSM_CERT2: Statics.ssmSigningCertificate2,
      },
    });
    cert1.grantRead(jwks);
    cert2.grantRead(jwks);
    return jwks;
  }

  openidConfigurationEndpoint() {
    return new ConfigFunction(this, 'openid-configuration');
  }


  createSubdomain(props: AuthenticationServiceStackProps) {
    const accountHostedZone = HostedZone.fromHostedZoneAttributes(this, 'account-hostedzone', {
      hostedZoneId: StringParameter.valueForStringParameter(this, Statics.accountHostedZoneId),
      zoneName: StringParameter.valueForStringParameter(this, Statics.accountHostedZoneName),
    });

    const subdomain = `${props.configuration.subdomain}.${accountHostedZone.zoneName}`;
    const hostedzone = new HostedZone(this, 'hostedzone', {
      zoneName: subdomain,
    });

    if (!hostedzone.hostedZoneNameServers) {
      throw Error('Nameservers should be set');
    }
    new NsRecord(this, 'ns-record', {
      zone: accountHostedZone,
      recordName: subdomain,
      values: hostedzone.hostedZoneNameServers,
    });
    return hostedzone;
  }

  certificate(hostedzone: HostedZone) {
    const cert = new Certificate(this, 'certificate', {
      domainName: hostedzone.zoneName,
      validation: CertificateValidation.fromDns(hostedzone),
    });
    return cert;
  }

}

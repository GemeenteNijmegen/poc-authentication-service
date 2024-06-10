import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { IdentitySource, LambdaIntegration, RequestAuthorizer, RestApi, SecurityPolicy } from 'aws-cdk-lib/aws-apigateway';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, NsRecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { JwtAuthorizerFunction } from './authorizer/JwtAuthorizer-function';
import { SecureFunction } from './secure/secure-function';
import { Statics } from './Statics';
import { TokenFunction } from './token/token-function';
import { JwksFunction } from './well-known/jwks/jwks-function';
import { ConfigFunction } from './well-known/openid-configuration/config-function';


export class AuthenticationServiceStack extends Stack {

  private readonly subdomain: HostedZone;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    Aspects.of(this).add(new PermissionsBoundaryAspect());

    // Setup a subdomain, certificate and REST API Gateway
    this.subdomain = this.createSubdomain();
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
    const secure = api.root.addResource('secure');
    const oauth = api.root.addResource('oauth');
    const wellKnown = oauth.addResource('.well-known');
    const jwksJson = wellKnown.addResource('jwks.json');
    const openidConfiguration = wellKnown.addResource('openid-configuration');
    const token = oauth.addResource('token');

    token.addMethod('POST', new LambdaIntegration(this.tokenEndpoint()));
    jwksJson.addMethod('GET', new LambdaIntegration(this.jwksEndpoint()));
    openidConfiguration.addMethod('GET', new LambdaIntegration(this.openidConfigurationEndpoint()));

    // Example resource server side
    const jwtAuthorizer = this.requestAuthorizer();
    const exampleIntegration = new LambdaIntegration(this.secureEndpoint());
    secure.addMethod('GET', exampleIntegration, {
      authorizer: jwtAuthorizer,

    });
    secure.addMethod('POST', exampleIntegration, {
      authorizer: jwtAuthorizer,
    });

  }

  tokenEndpoint() {
    const privateKeySecret = new Secret(this, 'private-key', {
      description: 'Private key for signing jwts',
    });
    const tokenFunction = new TokenFunction(this, 'tokens', {
      environment: {
        PRIVATE_KEY_ARN: privateKeySecret.secretArn,
        ISSUER: this.subdomain.zoneName,
      },
    });
    privateKeySecret.grantRead(tokenFunction);
    return tokenFunction;
  }

  jwksEndpoint() {
    return new JwksFunction(this, 'jwks');
  }

  secureEndpoint() {
    return new SecureFunction(this, 'secure');
  }

  openidConfigurationEndpoint() {
    return new ConfigFunction(this, 'openid-configuration');
  }


  requestAuthorizer() {
    return new RequestAuthorizer(this, 'request-authorizer', {
      handler: new JwtAuthorizerFunction(this, 'jwt-authorizer', {
        environment: {
          REQUIRED_SCOPE: 'test',
          ISSUER: this.subdomain.zoneName,
        },
      }),
      resultsCacheTtl: Duration.minutes(0), // no cashing
      identitySources: [
        IdentitySource.header('Authorization'),
      ],
    });
  }


  createSubdomain() {
    const accountHostedZone = HostedZone.fromHostedZoneAttributes(this, 'account-hostedzone', {
      hostedZoneId: StringParameter.valueForStringParameter(this, Statics.accountHostedZoneId),
      zoneName: StringParameter.valueForStringParameter(this, Statics.accountHostedZoneName),
    });

    const subdomain = `authentication.${accountHostedZone.zoneName}`;
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

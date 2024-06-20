import { Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { Statics } from './Statics';

export interface ParameterStageProps extends Configurable, StageProps {}

export class ParameterStage extends Stage {
  constructor(scope: Construct, id: string, props: ParameterStageProps) {
    super(scope, id, props);
    new ParameterStack(this, 'stack', {
      env: props.configuration.deployToEnvironment,
    });
  }
}

class ParameterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.jwtSigningCertificates();

  }

  private jwtSigningCertificates() {
    new StringParameter(this, 'ssm-jwks-certificate-1', {
      stringValue: '-',
      parameterName: Statics.ssmSigningCertificate1,
      description: 'Certificate that can be used for signing JWTs (1/2)',
    });
    new StringParameter(this, 'ssm-jwks-certificate-2', {
      stringValue: '-',
      parameterName: Statics.ssmSigningCertificate2,
      description: 'Certificate that can be used for signing JWTs (2/2). Use for rollover',
    });
    const pk1 = new Secret(this, 'private-key-jwks-cert-1', {
      secretName: Statics.secretSigningCertificate1,
      description: 'Private key for JWT signing certificate (1/2)',
    });
    const pk2 = new Secret(this, 'private-key-jwks-cert-2', {
      secretName: Statics.secretSigningCertificate2,
      description: 'Private key for JWT signing certificate (2/2)',
    });
    new StringParameter(this, 'ssm-signing-pk-1', {
      stringValue: pk1.secretArn,
      parameterName: Statics.ssmSigningPrivateKeyArn1,
    });
    new StringParameter(this, 'ssm-signing-pk-2', {
      stringValue: pk2.secretArn,
      parameterName: Statics.ssmSigningPrivateKeyArn2,
    });
  }

}
import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stage, StageProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthenticationServiceStack } from './AuthenticationServiceStack';
import { Configurable } from './Configuration';
import { Statics } from './Statics';

interface AuthenticationServiceStageProps extends StageProps, Configurable { }

/**
 * Stage responsible for the Authentication Service
 */
export class AuthenticationServiceStage extends Stage {

  constructor(scope: Construct, id: string, props: AuthenticationServiceStageProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    new AuthenticationServiceStack(this, 'service-stack', { configuration: props.configuration } );

  }
}

import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Stack, StackProps, Tags, pipelines, Aspects, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthenticationServiceStage } from './AuthenticationServiceStage';
import { Configurable, Configuration } from './Configuration';
import { ParameterStage } from './ParameterStage';
import { Statics } from './Statics';

export interface PipelineStackProps extends StackProps, Configurable {}

export class PipelineStack extends Stack {
  private readonly configuration: Configuration;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    this.configuration = props.configuration;

    const connectionArn = new CfnParameter(this, 'connectionArn');
    const source = this.connectionSource(connectionArn);
    const pipeline = this.pipeline(source);

    const parameterStage = new ParameterStage(this, 'parameters', {
      env: this.configuration.deployToEnvironment,
      configuration: props.configuration,
    });
    pipeline.addStage(parameterStage);

    const authenticationServiceStage = new AuthenticationServiceStage(this, 'authentication-service-stage', {
      env: this.configuration.deployToEnvironment,
      configuration: this.configuration,
    });
    pipeline.addStage(authenticationServiceStage);

  }

  pipeline(source: pipelines.CodePipelineSource): pipelines.CodePipeline {
    const synthStep = new pipelines.ShellStep('Synth', {
      input: source,
      env: {
        BRANCH_NAME: this.configuration.branchName,
      },
      commands: [
        'yarn install --frozen-lockfile',
        'npx projen build',
        'npx projen synth',
      ],
    });

    const pipeline = new pipelines.CodePipeline(this, `pipeline-${this.configuration.branchName}`, {
      pipelineName: `${Statics.projectName}-${this.configuration.branchName}`,
      crossAccountKeys: true,
      synth: synthStep,
    });
    return pipeline;
  }

  private connectionSource(connectionArn: CfnParameter): pipelines.CodePipelineSource {
    return pipelines.CodePipelineSource.connection(`${Statics.repositoryOwner}/${Statics.repository}`, this.configuration.branchName, {
      connectionArn: connectionArn.valueAsString,
    });
  }
}

import { App } from 'aws-cdk-lib';
import { getConfiguration } from './Configuration';
import { PipelineStack } from './PipelineStack';

const app = new App();
const branchToBuild = process.env.BRANCH_NAME ?? 'main';
console.log(`building branch ${branchToBuild}`);
const configuration = getConfiguration(branchToBuild);

new PipelineStack(app, `pipeline-${configuration.branchName}`,
  {
    env: configuration.deployFromEnvironment,
    configuration: configuration,
  },
);
app.synth();
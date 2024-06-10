import { App } from 'aws-cdk-lib';
import { AuthenticationServiceStack } from './AuthenticationServiceStack';

const devEnv = {
  account: '049753832279',
  region: 'eu-central-1',
};

const app = new App();

new AuthenticationServiceStack(app, 'authentication-service-stack', { env: devEnv });

app.synth();
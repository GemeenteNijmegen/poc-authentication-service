import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AuthenticationServiceStack } from '../src/AuthenticationServiceStack';

test('Snapshot', () => {
  const app = new App();
  const stack = new AuthenticationServiceStack(app, 'test', { configuration: {} as any });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
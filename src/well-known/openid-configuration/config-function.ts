// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props for ConfigFunction
 */
export interface ConfigFunctionProps extends lambda.FunctionOptions {
}

/**
 * An AWS Lambda function which executes src/well-known/openid-configuration/config.
 */
export class ConfigFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props?: ConfigFunctionProps) {
    super(scope, id, {
      description: 'src/well-known/openid-configuration/config.lambda.ts',
      ...props,
      runtime: new lambda.Runtime('nodejs20.x', lambda.RuntimeFamily.NODEJS),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../assets/well-known/openid-configuration/config.lambda')),
    });
    this.addEnvironment('AWS_NODEJS_CONNECTION_REUSE_ENABLED', '1', { removeInEdge: true });
  }
}
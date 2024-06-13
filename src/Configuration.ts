import { Environment as CdkEnvironment } from 'aws-cdk-lib';
import { Statics } from './Statics';

export interface Configurable {
  readonly configuration: Configuration;
}

/**
 * Make account and region required
 */
export interface Environment extends CdkEnvironment {
  account: string;
  region: string;
}

export interface Configuration {
  readonly deployFromEnvironment: Environment;
  readonly deployToEnvironment: Environment;

  /**
   * The branch name this configuration is used for
   */
  readonly branchName: string;


  /**
   * The subdomain of our main subdomain (`account`.csp-nijmegen.nl) this
   * API will be accessible at.
   */
  readonly subdomain?: string;
}

export function getConfiguration(branchName: string): Configuration {
  const configName = Object.keys(configurations).find((configurationName) => {
    const config = configurations[configurationName];
    return config.branchName == branchName;
  });
  if (configName) {
    return configurations[configName];
  }
  throw Error(`No configuration found for branch name ${branchName}`);
}

const configurations: { [name: string] : Configuration } = {
//   acceptance: {
//     branchName: 'acceptance',
//     subdomain: 'auth-service',
//     deployFromEnvironment: Statics.gnBuildEnvironment,
//     deployToEnvironment: Statics.appAccpEnvironment,
//   },
  main: {
    branchName: 'main',
    subdomain: 'auth-service',
    deployFromEnvironment: Statics.appSandboxEnvironment,
    deployToEnvironment: Statics.appSandboxEnvironment,
  },
};

export abstract class Statics {
  static readonly projectName = 'authentication-service';
  static readonly repositoryOwner: string = 'GemeenteNijmegen';
  static readonly repository: string = 'poc-authentication-service';

  static readonly accountHostedZoneId = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly accountHostedZoneName = '/gemeente-nijmegen/account/hostedzone/name';

  /**
   * Environments
   */
  static readonly gnBuildEnvironment = {
    account: '836443378780',
    region: 'eu-central-1',
  }; // Wordt nu nog niet gebruikt. POC.

  static readonly appSandboxEnvironment = {
    account: '833119272131', //gn-sandbox-01
    region: 'eu-central-1',
  };

}
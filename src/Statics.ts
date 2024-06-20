export abstract class Statics {
  static readonly projectName = 'authentication-service';
  static readonly repositoryOwner: string = 'GemeenteNijmegen';
  static readonly repository: string = 'poc-authentication-service';

  static readonly accountHostedZoneId = '/gemeente-nijmegen/account/hostedzone/id';
  static readonly accountHostedZoneName = '/gemeente-nijmegen/account/hostedzone/name';

  // JWT Signing certificates
  static readonly ssmSigningCertificate1 = `/${Statics.projectName}/jwt-signing-cert-1/pem`;
  static readonly ssmSigningCertificate2 = `/${Statics.projectName}/jwt-signing-cert-2/pem`;
  static readonly secretSigningCertificate1 = `/${Statics.projectName}/jwt-signing-cert-1/privateKey`;
  static readonly secretSigningCertificate2 = `/${Statics.projectName}/jwt-signing-cert-2/privateKey`;
  static readonly ssmSigningPrivateKeyArn1 = `/${Statics.projectName}/jwt-signing-cert-1/privateKeyArn`;
  static readonly ssmSigningPrivateKeyArn2 = `/${Statics.projectName}/jwt-signing-cert-2/privateKeyArn`;

  // ENVIRONMENTS

  static readonly gnBuildEnvironment = {
    account: '836443378780',
    region: 'eu-central-1',
  }; // Wordt nu nog niet gebruikt. POC.

  static readonly appSandboxEnvironment = {
    account: '833119272131', //gn-sandbox-01
    region: 'eu-central-1',
  };

}
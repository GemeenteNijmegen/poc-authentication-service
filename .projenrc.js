const { GemeenteNijmegenCdkApp } = require('@gemeentenijmegen/projen-project-type');
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  devDeps: ['@gemeentenijmegen/projen-project-type'],
  deps: [
    '@types/aws-lambda',
    '@gemeentenijmegen/apigateway-http',
    '@gemeentenijmegen/aws-constructs',
    '@gemeentenijmegen/utils',
    'jose',
  ],
  name: 'authentication-service',
  gitignore: [
    'jwk',
  ],
});
project.synth();
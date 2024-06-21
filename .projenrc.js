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
    'zod',
    '@types/pem-jwk',
    'pem-jwk',
    '@trust/keyto',
    '@types/@trust/keyto',
  ],
  name: 'authentication-service',
  gitignore: [
    'jwk',
  ],
  jestOptions: {
    jestConfig: {
      testPathIgnorePatterns: ['/node_modules/', '/cdk.out', '/test/playwright'],
      roots: ['src', 'test'],
    },
  },
});
project.synth();
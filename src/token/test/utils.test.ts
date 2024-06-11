import { CLIENTS } from './ConfigurationFixture';
import { Utils } from '../Utils';

describe('Scope tests', () => {

  test('One scopes in config', async() => {
    expect(Utils.scopesFromClientConfiguration(CLIENTS.readClient)).toEqual(['read']);
  });

  test('Two scopes in config', async() => {
    expect(Utils.scopesFromClientConfiguration(CLIENTS.adminClient)).toEqual(['read', 'write']);
  });

  test('Three scopes in config, two duplicate', async() => {
    expect(Utils.scopesFromClientConfiguration(CLIENTS.duplicateClient)).toEqual(['read', 'write', 'admin']);
  });
});

describe('Audience tests', () => {

  test('One scopes in config', async() => {
    expect(Utils.audiencesFromClientConfiguration(CLIENTS.readClient)).toEqual(['example-api']);
  });

  test('Two scopes in config', async() => {
    expect(Utils.audiencesFromClientConfiguration(CLIENTS.adminClient)).toEqual(['example-api']);
  });

  test('Three scopes in config, two duplicate', async() => {
    expect(Utils.audiencesFromClientConfiguration(CLIENTS.duplicateClient)).toEqual(['example-api', 'example-api-2']);
  });
});

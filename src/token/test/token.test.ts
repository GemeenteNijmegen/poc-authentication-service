import { AWS } from '@gemeentenijmegen/utils';
import { ClientConfiguration } from '../../Authorization';
import { audiencesFromClientConfiguration, authenticateRequest, scopesFromClientConfiguration } from '../token.lambda';

jest.spyOn(AWS, 'getSecret').mockResolvedValue(
  'abc',
);


beforeAll(() => {
  process.env.PRIVATE_KEY_ARN = 'abc';
});

test('Authentication using basic auth', async () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
    body: 'abc=def',
  } as any)).toBe('readClient');
});

test('Authentication no body', async () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
  } as any)).toBe('readClient');
});

test('Authentication in body', async () => {
  expect(authenticateRequest({
    body: 'client_id=readClient&client_secret=geheim',
  } as any)).toBe('readClient');
});

test('Authentication using basic auth and body', async () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;

  expect(authenticateRequest({
    headers: {
      Authorization: header,
    },
    body: 'client_id=readClient&client_secret=geheim',
  } as any)).toBe('readClient');
});


describe('Scope tests', () => {
  const readClient: ClientConfiguration = {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read'],
      },
    ],
  };
  const adminClient: ClientConfiguration = {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read', 'write'],
      },
    ],
  };

  const duplicateClient: ClientConfiguration = {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read', 'write'],
      },
      {
        endpoint: 'example-api-2',
        scopes: ['read', 'write', 'admin'],
      },
    ],
  };
  test('One scopes in config', async() => {
    expect(scopesFromClientConfiguration(readClient)).toEqual(['read']);
  });

  test('Two scopes in config', async() => {
    expect(scopesFromClientConfiguration(adminClient)).toEqual(['read', 'write']);
  });

  test('Three scopes in config, two duplicate', async() => {
    expect(scopesFromClientConfiguration(duplicateClient)).toEqual(['read', 'write', 'admin']);
  });
});

describe('Audience tests', () => {
  const readClient: ClientConfiguration = {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read'],
      },
    ],
  };
  const adminClient: ClientConfiguration = {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read', 'write'],
      },
    ],
  };

  const duplicateClient: ClientConfiguration = {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read', 'write'],
      },
      {
        endpoint: 'example-api-2',
        scopes: ['read', 'write', 'admin'],
      },
    ],
  };
  test('One scopes in config', async() => {
    expect(audiencesFromClientConfiguration(readClient)).toEqual(['example-api']);
  });

  test('Two scopes in config', async() => {
    expect(audiencesFromClientConfiguration(adminClient)).toEqual(['example-api']);
  });

  test('Three scopes in config, two duplicate', async() => {
    expect(audiencesFromClientConfiguration(duplicateClient)).toEqual(['example-api', 'example-api-2']);
  });
});

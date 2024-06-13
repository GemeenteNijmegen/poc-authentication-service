import { CLIENTS } from './ConfigurationFixture';
import { InvalidRequest } from '../Errors';
import { TokenEndpointHandler } from '../TokenEndpointHandler';

const ISSUER = 'example.com/custom-idp';

describe('Client authentication', () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;
  const body = 'client_id=readClient&client_secret=geheim';

  const handler = new TokenEndpointHandler('', CLIENTS, ISSUER );

  test('Authentication using basic auth', () => {
    const clientId = handler.authenticateRequest({
      authorizationHeader: header,
      params: new URLSearchParams('abc=def'),
    });
    expect(clientId).toBe('readClient');
  });

  test('Authentication no body', () => {
    const clientId = handler.authenticateRequest({
      authorizationHeader: header,
      params: new URLSearchParams(''),
    });
    expect(clientId).toBe('readClient');
  });

  test('Authentication in body', () => {
    const clientId = handler.authenticateRequest({
      authorizationHeader: undefined,
      params: new URLSearchParams(body),
    });
    expect(clientId).toBe('readClient');
  });

  test('Authentication using basic auth and body', () => {
    expect(() => {
      handler.authenticateRequest({
        params: new URLSearchParams(body),
        authorizationHeader: header,
      });
    }).toThrow(InvalidRequest);
  });

});


describe('Authorize requested scopes', () => {
  const handler = new TokenEndpointHandler('', CLIENTS, ISSUER );

  test('Request scopes gives only allowed scopes', () => {
    const issuedScopes = handler.authorizeRequestedScopes({
      params: new URLSearchParams({
        scope: 'read write',
      }),
    }, CLIENTS.readClient);
    expect(issuedScopes).toEqual(['read']);
  });

  test('Request no scopes gives all client scopes', () => {
    const issuedScopes = handler.authorizeRequestedScopes({
      params: new URLSearchParams(),
    }, CLIENTS.readClient);
    expect(issuedScopes).toEqual(['read']);
  });

  test('Request only unauthorized scopes throws an error', () => {
    const fn = () => {
      handler.authorizeRequestedScopes({
        params: new URLSearchParams({
          scope: 'write',
        }),
      }, CLIENTS.readClient);
    };
    expect(fn).toThrow();
  });
});


describe('token exchange tests', () => {
  const handler = new TokenEndpointHandler('', CLIENTS, ISSUER );

  test('Should request validates', async() => {
    const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
    const header = `Basic ${credentials}`;
    handler.validateRequest({
      authorizationHeader: header,
      params: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: 'tests',
        subject_token_type: 'Bearer',
      }),
    });
  });

  test('Authorize provided JWT', async() => {
    expect(handler.validatedSubjectToken('eyJraWQiOiJRMUl6T1JYZWo0cFRJTWhVM3lZaGtxNVpReWIzOU00bnVGb0h1LTQ0b2ZZIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI5MDAwMjYyMzYiLCJhdWQiOiJBYXdvb3RXNTc0TXFJTVJBZkFnemR2OGxoUVlMdUdZMyIsImFjciI6InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOk1vYmlsZVR3b0ZhY3RvckNvbnRyYWN0Iiwic2ltdWxhdG9yLWF1dGhvcml6YXRpb24iOnRydWUsImFtciI6InNpbXVsYXRvciIsImlzcyI6Imh0dHBzOlwvXC9hdXRoZW50aWNhdGllLWFjY3AubmlqbWVnZW4ubmxcL2Jyb2tlclwvc3BcL29pZGMiLCJzdWJqZWN0X2lzc3VlciI6InNpbXVsYXRvciIsImV4cCI6MTcxODI3Mjk3NSwiaWF0IjoxNzE4MjcxMTc1fQ.QuAGOzu5mHdTuU4qemPldSt3ek6iPQcaE9gxdynn8mt5lJpoNQaIzi6-FycUsMOVToQE39ECMJ75SuW24PlzCczvklzxZuN4NyNPG29bATekGrIYDoXlW71mKf9Y6F_A0LbnFYtX3RyQeKW4TnKwQdCNJMNxDN4VTSwAxJjuk7gk0ghtN8KimU-8x-gazQmk_IIuRRY-bocagQ4iTL66_mdv7ScsYy3KK80Ven3i5FAoL2uD3loKODW1YuJIyg2cGT9-Tct9C7NiPQYg_5yU_LfWpfKqHghFSFPVI2x8d7-yRsJUHpfylLRD6Jj7EqEQV7DpgJQQTpR_2miIs7UTIg')).toBeTruthy();
  });

});

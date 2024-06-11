import { CLIENTS, KNOWN_SCOPES } from './ConfigurationFixture';
import { InvalidRequest } from '../Errors';
import { TokenEndpointHandler } from '../TokenEndpointHandler';

const ISSUER = 'example.com/custom-idp';

describe('Client authentication', () => {
  const credentials = Buffer.from('readClient:geheim', 'utf-8').toString('base64');
  const header = `Basic ${credentials}`;
  const body = 'client_id=readClient&client_secret=geheim';

  const handler = new TokenEndpointHandler('', KNOWN_SCOPES, CLIENTS, ISSUER );

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
  const handler = new TokenEndpointHandler('', KNOWN_SCOPES, CLIENTS, ISSUER );

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
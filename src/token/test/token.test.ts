import { generateKeyPair } from 'crypto';
import * as util from 'util';
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

  test('Should request validates', async() => {
    const generate = util.promisify(generateKeyPair);
    const keyPair = await (async () => {
      return generate('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });
    })();
    const handler = new TokenEndpointHandler(keyPair.privateKey, CLIENTS, ISSUER );

    const result = await handler.handleTokenExchangeRequest({
      params: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: 'eyJraWQiOiJRMUl6T1JYZWo0cFRJTWhVM3lZaGtxNVpReWIzOU00bnVGb0h1LTQ0b2ZZIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI5MDAwMjYyMzYiLCJhdWQiOiJBYXdvb3RXNTc0TXFJTVJBZkFnemR2OGxoUVlMdUdZMyIsImFjciI6InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOk1vYmlsZVR3b0ZhY3RvckNvbnRyYWN0Iiwic2ltdWxhdG9yLWF1dGhvcml6YXRpb24iOnRydWUsImFtciI6InNpbXVsYXRvciIsImlzcyI6Imh0dHBzOlwvXC9hdXRoZW50aWNhdGllLWFjY3AubmlqbWVnZW4ubmxcL2Jyb2tlclwvc3BcL29pZGMiLCJzdWJqZWN0X2lzc3VlciI6InNpbXVsYXRvciIsImV4cCI6MTcxODI4MDMyMiwiaWF0IjoxNzE4Mjc4NTIyfQ.KI7gJkG7aMCCJ1StXF-cUvXUbD6mDh2eOwa6c-tmUEjqdQm-4OUGsFd6yRi7ecXYnwNoHVF95ntgUgDGNtt6RLEuDu5rKhlo9923d4PPPXNS82IGu9m5ej22LYWzs5ZPLrBDaIWBjXoBYHRok1gbJl0AQPS5o8vgwJPVkTtX4WBGZ3B0iMbAaxvgeflHEF7_9kKLWPDnc0_ocwrbNkU2P_TzO1Z9CMkuNmObxZucvVzZQDuYh0W7ZiLb47SrxSR5Is2w_SFuiZW4b6wiNYj8JBbAhxze6XAhJN7HMGaLa8C1ogs4jB5KuniFX4jwazJ4dezylef4uEr1Ogh65k-erw',
        subject_token_type: 'Bearer',
      }),
    }, 'delegateClient');
    expect(result).toBeTruthy();
  });

});

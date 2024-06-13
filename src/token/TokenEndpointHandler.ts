import * as crypto from 'crypto';
import { SignJWT, createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import { InvalidClient, InvalidRequest, InvalidScope, InvalidTarget, OAuthError, UnauthorizedClient, UnsupportedGrantType } from './Errors';
import { Utils } from './Utils';
import { ClientConfiguration } from '../Authorization';

const TOKEN_LIFETIME_SECONDS = 3600;

export interface TokenEndpointRequest {
  /**
   * Parsed params in request body
   */
  params: URLSearchParams;

  /**
   * Authorization header value
   */
  authorizationHeader?: string;
}

export interface TokenEndpointResponse {
  /**
   * The type of token that is issued by this token endpoint
   * Note: only Bearer tokens are supported
   */
  token_type: 'Bearer';
  /**
   * The JWT token is issued as an access token
   */
  access_token: string;
  /**
   * Spaces separated list of tokens that are returned
   */
  scope: string;
  /**
   * Expiration time for the access token in seconds.
   */
  expires_in: number;
  /**
   * Refresh token used to request a new access token.
   * Note: the client_credentials grant_type does not allow
   *       refresh tokens, therefore this is undefined
   */
  refresh_token: undefined;
}


export class TokenEndpointHandler {

  private readonly privateKey: string;
  private readonly clients: Record<string, ClientConfiguration>;
  private readonly issuer: string;

  /**
   * Instantiate a token endpoint handler with a private key used for
   * signing jwt tokens
   * @param privateKey
   */
  constructor(privateKey: string, clients: Record<string, ClientConfiguration>, issuer: string) {
    this.privateKey = privateKey;
    this.issuer = issuer;
    this.clients = clients;
  }

  async handle(request: TokenEndpointRequest) {
    try {
      const clientId = this.authenticateRequest(request);
      const grant_type = request.params.get('grant_type');
      if (grant_type == 'client_credentials') {
        return await this.handleClientCredentialsRequest(request, clientId);
      } else if (grant_type == 'urn:ietf:params:oauth:grant-type:token-exchange') {
        return await this.handleTokenExchangeRequest(request, clientId);
      }
      throw new UnsupportedGrantType('Only client_credentials and token-exhange grant types are supported');

    } catch (error) {
      console.error(error);
      if (error instanceof OAuthError) {
        return {
          statusCode: error.httpCode,
          body: JSON.stringify({ error: error.error, description: error.description }),
        };
      }
      return {
        statusCode: 500,
        body: 'unhandled error',
      };
    }
  }

  async handleClientCredentialsRequest(request: TokenEndpointRequest, clientId: string) {
    const issuedScopes = this.authorizeRequestedScopes(request, this.clients[clientId]);
    return this.tokenResponse(issuedScopes, clientId, this.privateKey);
  }

  async handleTokenExchangeRequest(request: TokenEndpointRequest, clientId: string) {
    this.validateTokenExchangeRequest(request);
    const unsafeSubjectTokenString = request.params.get('subject_token');
    if (!unsafeSubjectTokenString) {
      throw new InvalidRequest('No subject token provided');
    }
    const subjectToken = await this.validatedSubjectToken(unsafeSubjectTokenString, clientId);
    // Nu token exchange doen
    console.log(clientId, subjectToken);

    // const issuedScopes = this.authorizeRequestedScopesForTokenRequest(request, this.clients[clientId]);
  }

  validateTokenExchangeRequest(request: TokenEndpointRequest) {
    const required_params = ['subject_token', 'subject_token_type'];
    for (let param of required_params) {
      if (!request.params.get(param)) {
        throw new InvalidRequest(`Missing required parameter ${param}`);
      }
    }
  }

  async validatedSubjectToken(tokenString: string, clientId: string) {
    const client = this.clients[clientId];
    const unsafeToken = decodeJwt(tokenString);
    const issuer = unsafeToken.iss;
    const exchange = client.tokenExchanges?.find(possibleExchange => possibleExchange.trustedIssuer === issuer);
    if (!exchange) {
      throw new InvalidRequest('Untrusted token issuer');
    }

    const jwks = createRemoteJWKSet(new URL(`${issuer}/certs`)); //TODO: discovery
    const result = await jwtVerify(tokenString, jwks, {
      issuer: issuer,
    });
    const claims = exchange.mapping(result.payload);

    return result;

    // if (Array.isArray(result.payload.aud) && !result.payload.aud?.includes(configuration.audience)) {
    //   throw Error('Wrong audience');
    // } else if (result.payload.aud != configuration.audience) {
    //   throw Error('Wrong audience');
    // }

    // const requirements = getEndpointAuthorizationRequirements(event.path, event.httpMethod);

    // console.log('Auth requirements', requirements);

    // const scopes = (result.payload.scope as string);
    // if (scopes && scopes.split(' ').find(scope => scope == requirements.requiredScope)) {
    //   return result.payload.sub;
    // }

    // throw new Unauthorized();
  }

  /**
   * Try to authenticate the client using client_credentials
   * @param request
   * @returns the client_id if authentication is succesful
   */
  authenticateRequest(request: TokenEndpointRequest) {
    const client_id = request.params.get('client_id');
    const client_secret = request.params.get('client_secret');
    const authorization = request.authorizationHeader;


    if ((client_id || client_secret) && authorization) {
      throw new InvalidRequest('Cannot use client_credentials via basic auth and in request body simultaniously');
    }

    let credentials = { client_id, client_secret };
    if (authorization) {
      credentials = Utils.parseAuthenticationHeader(authorization);
    }

    if (!credentials.client_id || !credentials.client_secret) {
      throw new InvalidClient('Please provide client_id and client_secret');
    }

    console.log('Trying to authenticate client', credentials.client_id);

    if (this.clients[credentials.client_id].secret !== credentials.client_secret) {
      throw new UnauthorizedClient('Invalid client credentials');
    }

    return credentials.client_id;
  }

  /**
   * Check if the client is authorized for all the requested scopes.
   * @param request
   * @param client
   * @returns all requested scopes the client is authorized for (defaults to all scopes for the client)
   */
  authorizeRequestedScopes(request: TokenEndpointRequest, client: ClientConfiguration) {
    const requestedScopes = request.params.get('scope');

    const allAllowedScopes = Utils.scopesFromClientConfiguration(client);

    if (requestedScopes) {
      const allowedScopes = requestedScopes.split(' ').filter(scope => allAllowedScopes.includes(scope));
      if (!allowedScopes || allowedScopes.length == 0) {
        throw new InvalidScope('There are no scopes in the request this client is authorized for');
      }
      return allowedScopes;
    }

    return allAllowedScopes;
  }

  async tokenResponse(scopes: string[], clientId: string, privateKeyParam: string): Promise<TokenEndpointResponse> {

    const now = new Date();
    const exp = new Date();
    exp.setSeconds(now.getSeconds() + TOKEN_LIFETIME_SECONDS);

    const token = await new SignJWT({
      aud: Utils.audiencesFromClientConfiguration(this.clients[clientId]),
      iss: `https://${this.issuer}/oauth`,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(exp.getTime() / 1000),
      sub: clientId,
      scope: scopes.join(' '),
      jti: crypto.randomUUID(),
    }).setProtectedHeader({
      alg: 'RS256',
      typ: 'JWT',
      kid: '0aa559a8-d56f-424c-b9bd-9dd598c3cf15',
    }).sign(crypto.createPrivateKey({
      key: privateKeyParam,
      format: 'pem',
    }));


    const response: TokenEndpointResponse = {
      token_type: 'Bearer',
      access_token: token,
      scope: scopes.join(' '),
      expires_in: 3600,
      refresh_token: undefined,
    };
    return response;


  }

}

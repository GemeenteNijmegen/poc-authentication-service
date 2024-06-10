import * as crypto from 'crypto';
import { AWS } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SignJWT } from 'jose';
import { InvalidClient, InvalidRequest, InvalidScope, OAuthError, UnauthorizedClient, UnsupportedGrantType } from './Errors';
import { ClientConfiguration, clients, knownScopes } from '../Authorization';


let privateKey: string | undefined = undefined;

async function init() {
  privateKey = await AWS.getSecret(process.env.PRIVATE_KEY_ARN!);
}
const initalization = init();

export async function handler(event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {
  console.log(event);

  await initalization;

  if (!privateKey) {
    throw Error('Whaaa');
  }

  try {
    validateRequest(event);
    const clientId = authenticateRequest(event);
    const scopes = authorizedScopes(event, clients[clientId]);
    return await tokenResponse(scopes, clientId, privateKey);
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

export function authorizedScopes(request: APIGatewayProxyEvent, client: ClientConfiguration) {
  const body = new URLSearchParams(request.body!);
  const requestedScopes = body.get('scope');

  if (!requestedScopes) {
    // All scopes allowed for this client
    return client.scopes;
  }

  const allowedScopes = requestedScopes.split(' ').filter(scope => client.scopes.includes(scope));
  if (!allowedScopes || allowedScopes.length == 0) {
    throw new InvalidScope('There are no scopes in the request this client is authorized for');
  }

  return allowedScopes;
}

export async function tokenResponse(scopes: string[], clientId: string, privateKeyParam: string) : Promise<APIGatewayProxyResult> {

  const now = new Date();
  const exp = new Date();
  exp.setHours(now.getHours() + 1);

  // if (!privateKey) {
  //   throw Error('No private key for signing');
  // }

  const token = await new SignJWT({
    aud: clientId,
    iss: `${process.env.ISSUER}/oauth`,
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


  const response = {
    token_type: 'Bearer',
    access_token: token,
    scope: scopes,
    expires_in: 3600,
    refresh_token: undefined, // Not allowed in the client_credentials grant type
  };

  return {
    body: JSON.stringify(response, null, 4),
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
    },
  };

}

export function validateRequest(request: APIGatewayProxyEvent) {

  if (!request.body) {
    throw new InvalidRequest('Missing request body');
  }

  const body = new URLSearchParams(request.body);

  if (body.get('grant_type') !== 'client_credentials') {
    throw new UnsupportedGrantType('Only client_credentials grant type is supported');
  }

  if (body.get('scope') !== null) {
    const unallowedScope = body.get('scope')?.split(' ').find(scope => !knownScopes.includes(scope));
    if (unallowedScope) {
      throw new InvalidScope(`Scope ${unallowedScope} is invalid`);
    }
  }

}

export function authenticateRequest(request: APIGatewayProxyEvent) {

  // Check body for credentials
  const body = new URLSearchParams(request.body!);
  let credentials = {
    client_id: body.get('client_id'),
    client_secret: body.get('client_secret'),
  };

  // Check if basic authentication is used
  const authHeader = request.headers?.Authorization;
  if (authHeader) {
    credentials = parseAuthenticationHeader(authHeader);
  }

  // Validate credentials
  if (!credentials.client_id || !credentials.client_secret) {
    throw new InvalidClient('No client credentials provided');
  }

  // Lookup credentials in client list
  if (clients[credentials.client_id].secret !== credentials.client_secret) {
    throw new UnauthorizedClient('Invalid client credentials');
  }

  return credentials.client_id;
}

function parseAuthenticationHeader(header: string) {
  if (!header.startsWith('Basic ')) {
    throw Error('Only basic authentication is supported');
  }
  const decoded = Buffer.from(header.substring(6), 'base64').toString('utf-8');
  const parts = decoded.split(':');
  return {
    client_id: parts[0],
    client_secret: parts[1],
  };
}
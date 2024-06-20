import { AWS } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TokenEndpointHandler } from './TokenEndpointHandler';
import { clients } from '../Authorization';

let tokenEndpointHandler : undefined | TokenEndpointHandler = undefined;
async function init() {
  const issuer = process.env.ISSUER!;

  // Load both keys
  const [key1, key2] = await Promise.all([
    AWS.getSecret(process.env.SINGING_PRIVATE_KEY1_ARN!),
    AWS.getSecret(process.env.SINGING_PRIVATE_KEY2_ARN!),
  ]);

  // Default to key 1, but if key2 is configured use that
  let keyToUse = key1;
  if (key2 && key2.startsWith('-----BEGIN PRIVATE KEY-----')) {
    keyToUse = key2;
    console.log('Second signing key is configured so using that key. First key can now be rolled over...');
  }

  tokenEndpointHandler = new TokenEndpointHandler(keyToUse, clients, issuer);
}
const initalization = init();


export async function handler(event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {
  await initalization;

  if (!tokenEndpointHandler) {
    return response({}, 500);
  }

  const tokenResponse = await tokenEndpointHandler.handle({
    authorizationHeader: event.headers?.Authorization,
    params: new URLSearchParams(event.body ?? ''),
  });
  return response(tokenResponse);
}

function response(body: any, code = 200) {
  return {
    body: JSON.stringify(body, null, 4),
    statusCode: code,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
    },
  };
}

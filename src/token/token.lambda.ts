import { AWS } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TokenEndpointHandler } from './TokenEndpointHandler';
import { clients, getKnownScopes } from '../Authorization';

let tokenEndpointHandler : undefined | TokenEndpointHandler = undefined;
async function init() {
  const issuer = process.env.ISSUER!;
  const privateKey = await AWS.getSecret(process.env.PRIVATE_KEY_ARN!);
  tokenEndpointHandler = new TokenEndpointHandler(privateKey, getKnownScopes(), clients, issuer);
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

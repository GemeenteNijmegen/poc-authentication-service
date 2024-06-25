import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TokenEndpointHandler } from './TokenEndpointHandler';
import { clients } from '../Authorization';
import { JwkService } from '../services/JwkService';

let tokenEndpointHandler : undefined | TokenEndpointHandler = undefined;

async function init() {
  const issuer = process.env.ISSUER!;
  if (!process.env.KEY_BUCKET_NAME) {
    throw Error('No key bucket name configured!');
  }
  const jwkService = new JwkService(new S3Client(), process.env.KEY_BUCKET_NAME );
  const keyPair = await jwkService.getActiveSigningKeyAndKeyId();
  tokenEndpointHandler = new TokenEndpointHandler(keyPair.privateKey, keyPair.kid, clients, issuer);
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



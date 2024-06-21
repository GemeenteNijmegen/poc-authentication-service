import { AWS } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { pemToJwk } from './pem2jwk';

// Initialization: build the jwks!
let cert1: any = undefined;
let cert2: any = undefined;
const jwks = { keys: [] as any };
async function init() {
  const cert1Pem = await AWS.getParameter(process.env.SSM_CERT1!);
  cert1 = pemToJwk(cert1Pem);
  jwks.keys.push(cert1);

  if (process.env.SSM_CERT2) {
    const cert2Pem = await AWS.getParameter(process.env.SSM_CERT2);
    if (cert2Pem.startsWith('-----BEGIN CERTIFICATE-----')) {
      cert2 = pemToJwk(cert2Pem);
      jwks.keys.push(cert2);
    }
  }
}
const initalization = init();


export async function handler(_event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {
  await initalization;
  return {
    body: JSON.stringify(jwks),
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode: 200,
  };
}

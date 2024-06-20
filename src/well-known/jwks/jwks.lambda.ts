import * as crypto from 'crypto';
import { AWS } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as pemjwk from 'pem-jwk';

// Initialization: build the jwks!
let cert1: pemjwk.JWK<{kid: string}> | undefined = undefined;
let cert2: pemjwk.JWK<{kid: string}> | undefined = undefined;
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

function pemToJwk(certificate: string) {
  const x509 = new crypto.X509Certificate(certificate);
  const jwk = pemjwk.pem2jwk(certificate, {
    kid: x509.fingerprint256,
  });
  return jwk;
}
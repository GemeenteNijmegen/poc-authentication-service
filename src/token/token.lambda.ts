import * as crypto from 'crypto';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TokenEndpointHandler } from './TokenEndpointHandler';
import { clients } from '../Authorization';

let tokenEndpointHandler : undefined | TokenEndpointHandler = undefined;

async function init() {
  const issuer = process.env.ISSUER!;
  if (!process.env.KEY_BUCKET_NAME) {
    throw Error('No key bucket name configured!');
  }
  const keyPair = await findLatestKeyPair();
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


async function findLatestKeyPair() {
  const s3 = new S3Client();

  const keys = await s3.send(new ListObjectsV2Command({
    Bucket: process.env.KEY_BUCKET_NAME,
    Prefix: 'private-keys',
  }));

  // Sort by key
  const sorted = keys.Contents?.sort((a, b) => {
    if (!a?.Key || !b?.Key) {
      return 0;
    }
    return a.Key.localeCompare(b.Key);
  });

  // Get fist (newest key)
  if (!sorted || sorted.length == 0) {
    throw Error('No private signing keys found');
  }

  const privateKeyKey = sorted[0].Key;
  const publicKeyKey = privateKeyKey?.replace(/private/g, 'public');

  const privateKeyPemObject = await s3.send(new GetObjectCommand({
    Bucket: process.env.KEY_BUCKET_NAME,
    Key: privateKeyKey,
  }));
  const privateKeyPem = await privateKeyPemObject.Body?.transformToString();
  if (!privateKeyPem) {
    throw Error('No private key PEM could be loaded.');
  }

  const publicKeyPemObject = await s3.send(new GetObjectCommand({
    Bucket: process.env.KEY_BUCKET_NAME,
    Key: publicKeyKey,
  }));
  const publicKeyPem = await publicKeyPemObject.Body?.transformToString();
  if (!publicKeyPem) {
    throw Error('No Public key PEM could be loaded.');
  }
  const kid = crypto.createHash('sha265').update(publicKeyPem).digest('hex');

  return {
    privateKey: privateKeyPem,
    kid: kid,
  };


}
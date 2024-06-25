import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { pemToJwk } from './pem2jwk';

const jwks = { keys: [] as any };
async function init() {

  if (!process.env.KEY_BUCKET_NAME) {
    throw Error('Bucket name not set');
  }

  // List all public keys in the bucket
  const s3 = new S3Client();
  const publicKeyObjects = await s3.send(new ListObjectsV2Command({
    Bucket: process.env.KEY_BUCKET_NAME,
    Prefix: 'public-keys/',
  }));

  if (!publicKeyObjects.Contents) {
    throw Error('No public keys found in s3 buckets...');
  }

  // Get all pems
  const promises = publicKeyObjects.Contents.map(obj => {
    return s3.send(new GetObjectCommand({
      Bucket: process.env.KEY_BUCKET_NAME,
      Key: obj.Key,
    }));
  });
  const publicKeys = await Promise.all(promises);

  // Build the jwks response
  for (const key of publicKeys) {
    if (key.Body) {
      const jwk = pemToJwk(await key.Body.transformToString());
      jwks.keys.push(jwk);
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

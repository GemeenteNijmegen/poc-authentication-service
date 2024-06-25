import { S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { JwkService } from '../../services/JwkService';

let jwks: any = undefined;
export async function handler(_event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {
  if (!jwks) {
    if (!process.env.KEY_BUCKET_NAME) {
      throw Error('Bucket name not set');
    }
    const jwkService = new JwkService(new S3Client(), process.env.KEY_BUCKET_NAME);
    jwks = await jwkService.getJwks();
  }
  return {
    body: JSON.stringify(jwks),
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode: 200,
  };
}

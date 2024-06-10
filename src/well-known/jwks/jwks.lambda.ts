import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import JWKS from './jwks.json';

export async function handler(_event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {
  return {
    body: JSON.stringify(JWKS),
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode: 200,
  };
}
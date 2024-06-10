import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function handler(_event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> {

  const issuer = 'https://aysy4jy713.execute-api.eu-central-1.amazonaws.com/prod/oauth';

  return {
    body: JSON.stringify({
      issuer,
      token_endpoint: `${issuer}/token`,
      token_endpoint_auth_methods_supported: [
        // 'private_key_jwt',
        // 'tls_client_auth',
        'client_credentials', // Only supported for now (non complient with NL GOV OAuth 2.0 assurance profile)
      ],
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      authorization_endpoint: undefined, // Not needed for client_credentials grant only (however, non complient now)
      grant_types_supported: ['client_credentials'],
      scopes_supported: ['test', 'test2'],
      request_object_signing_alg_values_supported: ['RS256'],
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode: 200,
  };
}
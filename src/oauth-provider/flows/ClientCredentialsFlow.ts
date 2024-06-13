import { OAuthFlow } from './OAuthFlow';
import { ClientAuthenticator } from '../ClientAuthenticator';
import { OAuthProviderConfiguration } from '../OAuthProvider';
import { TokenRequest } from '../OAuthRequest';
import { AuthorizationResponse, TokenResponse } from '../OAuthResponse';
import { OAuthTokenGenerator } from '../OAuthTokenGenerator';


export class ClientCredentialsFlow extends OAuthFlow {

  getGrantType(): string {
    return 'client_credentials';
  }

  getResponseType(): string {
    return '<does not exist>';
  }

  authorizationRequest(): Promise<AuthorizationResponse> {
    throw new Error('This endpoint is not supported in the client credentials flow.');
  }

  async tokenRequest(request: TokenRequest, configuration: OAuthProviderConfiguration): Promise<TokenResponse> {

    // Authenticate client
    const authenticator = new ClientAuthenticator(configuration.clients);
    const { clientId, scopes } = authenticator.authenticate(request);

    // TODO actual authorization

    // Create the token
    const tokenGenerator = new OAuthTokenGenerator(configuration.tokenOptions, configuration.issuer);
    const jwt = await tokenGenerator.createToken(clientId, scopes);

    // Return token
    return {
      code: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
      access_token: jwt,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: scopes.join(' '),
      refresh_token: undefined, // Not allowed for this flow
      state: undefined, // Has no use in this flow
    };
  }

}
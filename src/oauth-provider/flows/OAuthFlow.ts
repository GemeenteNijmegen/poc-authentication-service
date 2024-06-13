import { OAuthProviderConfiguration } from '../OAuthProvider';
import { AuthorizationRequest, TokenRequest } from '../OAuthRequest';
import { AuthorizationResponse, TokenResponse } from '../OAuthResponse';

export abstract class OAuthFlow {
  abstract getGrantType(): string;
  abstract getResponseType(): string;
  abstract authorizationRequest(request: AuthorizationRequest, configuration: OAuthProviderConfiguration) : Promise<AuthorizationResponse>;
  abstract tokenRequest(request: TokenRequest, configuration: OAuthProviderConfiguration): Promise<TokenResponse>;
}


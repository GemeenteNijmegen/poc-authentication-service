
import { KeyObject } from 'crypto';
import { OAuthFlow } from './flows/OAuthFlow';
import { AuthorizationRequest, TokenRequest } from './OAuthRequest';
import { AuthorizationResponse, TokenResponse } from './OAuthResponse';
import { InvalidGrant } from '../token/Errors';

/**
 * Configuration for each client
 */
export interface Client {
  clientId: string;
  authenticationMethod: 'client_credentials' | 'jwt' | 'mtls';
  authenticationData: string;
  authorizations: Authorization[];
}

/**
 * Describes an endpoint and posible allowed scopes per client
 */
export interface Authorization {
  application: ResourceServer;
  allowedScopes: string[];
}

/**
 * Describes an resource server
 */
export interface ResourceServer {
  audience: string;
  availableScopes: string[];
}

export interface TokenOptions {
  token_type: 'jwt';
  signing: 'RS256';
  privateKey: KeyObject;
  tokenHook?: (claims: Record<string, any>) => Record<string, any>;
  ttl?: number;
  keyId: string;
}

export interface OAuthProviderConfiguration {
  issuer: string;
  clients: Client[];
  flows: OAuthFlow[];
  tokenOptions: TokenOptions;
}

export class OAuthProvider {

  readonly configuration: OAuthProviderConfiguration;

  constructor(configuration: OAuthProviderConfiguration) {
    this.configuration = configuration;
  }

  async authorizationRequest(request: AuthorizationRequest): Promise<AuthorizationResponse> {
    const responseType = this.getResponseTypeFromRequest(request);
    const handler = this.configuration.flows.find(flow => flow.getResponseType() === responseType);
    if (!handler) {
      throw new InvalidGrant(`${responseType} does not exist`);
    }
    return handler.authorizationRequest(request, this.configuration);
  }

  async tokenRequest(request: TokenRequest): Promise<TokenResponse> {
    request.validate();
    const grantType = this.getGrantTypeFromRequest(request);
    const handler = this.configuration.flows.find(flow => flow.getGrantType() === grantType);
    if (!handler) {
      throw new InvalidGrant(`${grantType} does not exist`);
    }
    return handler.tokenRequest(request, this.configuration);
  }

  private getGrantTypeFromRequest(_request: TokenRequest): string {
    return ''; // TODO lookinto parsing this
  }

  private getResponseTypeFromRequest(_request: AuthorizationRequest): string {
    return ''; // TODO lookinto parsing this
  }

}



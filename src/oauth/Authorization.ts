
/**
 * Configuration for each client
 */
export interface ClientConfiguration {
  secret: string;
  authorizations: Authorization[];
  tokenExchanges?: TokenExchange[];
}

export interface Authorization {
  resourceServer: ResourceServer;
  allowedScopes: string[];
}

/**
 * Registration of a resource server and its available scopes.
 */
export interface ResourceServer {
  /**
   * The audience that this resource server is.
   */
  audience: string;
  /**
   * A list of scopes that is supported by this resource server
   */
  availableScopes: string[];
}

/**
 * Describes an allowed token exchange
 */
export interface TokenExchange {
  /**
   * The issuer of the token that is being exchanged.
   */
  trustedIssuer: string;
  /**
   * A function that maps claims from the input token to the resulting token.
   * Can also be used to add additional data to the token.
   * @param claims
   * @returns
   */
  mapping: (claims: Record<string, any>) => Record<string, any>;
}

export function getKnownScopes(resourceServers: ResourceServer[]) {
  return resourceServers.reduce((scopes: string[], app: ResourceServer) => {
    return [...scopes, ...app.audience];
  }, []);
}

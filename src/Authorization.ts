
/**
 * Configuration for each client
 */
export interface ClientConfiguration {
  secret: string;
  authorizations: Authorization[];
}

export interface Authorization {
  endpoint: string;
  scopes: string[];
}

/**
 * A map of client ids and secrets
 */
export const clients: Record<string, ClientConfiguration> = {
  readClient: {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read'],
      },
    ],
  },
  writeClient: {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['write'],
      },
    ],
  },
  adminClient: {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read', 'write'],
      },
    ],
  },

};

/**
 * Supported scopes
 */
export const knownScopes = ['read', 'write'];
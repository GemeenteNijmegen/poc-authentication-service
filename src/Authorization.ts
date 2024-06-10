
/**
 * Configuration for each client
 */
export interface ClientConfiguration {
  secret: string;
  scopes: string[];
}

/**
 * A map of client ids and secrets
 */
export const clients: Record<string, ClientConfiguration> = {
  readClient: {
    secret: 'geheim',
    scopes: ['read'],
  },
  writeClient: {
    secret: 'geheim',
    scopes: ['write'],
  },
  adminClient: {
    secret: 'geheim',
    scopes: ['read', 'write'],
  },
};

/**
 * Supported scopes
 */
export const knownScopes = ['read', 'write'];
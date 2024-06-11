import { ClientConfiguration } from '../../Authorization';

/**
 * A map of client ids and secrets
 */
export const CLIENTS: Record<string, ClientConfiguration> = {
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
  duplicateClient: {
    secret: 'geheim',
    authorizations: [
      {
        endpoint: 'example-api',
        scopes: ['read', 'write'],
      },
      {
        endpoint: 'example-api-2',
        scopes: ['read', 'write', 'admin'],
      },
    ],
  },
};

/**
 * Supported scopes
 */
export const KNOWN_SCOPES = ['read', 'write'];
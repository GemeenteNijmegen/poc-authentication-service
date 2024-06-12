import { Application, ClientConfiguration } from '../../Authorization';

const app: Application = {
  audience: 'example-api',
  availableScopes: ['read', 'write'],
};
const app2: Application = {
  audience: 'example-api-2',
  availableScopes: ['read', 'write', 'admin'],
};

/**
 * A map of client ids and secrets
 */
export const CLIENTS: Record<string, ClientConfiguration> = {
  readClient: {
    secret: 'geheim',
    authorizations: [
      {
        application: app,
        allowedScopes: ['read'],
      },
    ],
  },
  writeClient: {
    secret: 'geheim',
    authorizations: [
      {
        application: app,
        allowedScopes: ['write'],
      },
    ],
  },
  adminClient: {
    secret: 'geheim',
    authorizations: [
      {
        application: app,
        allowedScopes: ['read', 'write'],
      },
    ],
  },
  duplicateClient: {
    secret: 'geheim',
    authorizations: [
      {
        application: app,
        allowedScopes: ['read', 'write'],
      },
      {
        application: app2,
        allowedScopes: ['read', 'write', 'admin'],
      },
    ],
  },
};

/**
 * Supported scopes
 */
export const KNOWN_SCOPES = ['read', 'write'];
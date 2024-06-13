import { ResourceServer, ClientConfiguration } from '../../Authorization';

const app: ResourceServer = {
  audience: 'example-api',
  availableScopes: ['read', 'write'],
};
const app2: ResourceServer = {
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
        resourceServer: app,
        allowedScopes: ['read'],
      },
    ],
  },
  writeClient: {
    secret: 'geheim',
    authorizations: [
      {
        resourceServer: app,
        allowedScopes: ['write'],
      },
    ],
  },
  adminClient: {
    secret: 'geheim',
    authorizations: [
      {
        resourceServer: app,
        allowedScopes: ['read', 'write'],
      },
    ],
  },
  duplicateClient: {
    secret: 'geheim',
    authorizations: [
      {
        resourceServer: app,
        allowedScopes: ['read', 'write'],
      },
      {
        resourceServer: app2,
        allowedScopes: ['read', 'write', 'admin'],
      },
    ],
  },
};

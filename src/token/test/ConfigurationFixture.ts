import { ClientConfiguration, ResourceServer } from '../../oauth/Authorization';


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
  delegateClient: {
    secret: 'geheim',
    authorizations: [
      {
        resourceServer: app,
        allowedScopes: ['read'],
      },
    ],
    tokenExchanges: [
      {
        trustedIssuer: 'https://authenticatie-accp.nijmegen.nl/broker/sp/oidc',
        mapping: (claims: Record<string, any>): Record<string, any> => {
          const bsn = claims.sub; //TODO: Yivi, eherkenning logic
          return {
            identifier: bsn,
            type: 'person',
          };
        },
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

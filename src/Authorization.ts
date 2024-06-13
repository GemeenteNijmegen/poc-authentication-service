
/**
 * Configuration for each client
 */
export interface ClientConfiguration {
  secret: string;
  authorizations: Authorization[];
  tokenExchanges?: TokenExchange[];
}

/**
 * Describes an endpoint and posible allowed scopes per client
 */
export interface Authorization {
  resourceServer: ResourceServer;
  allowedScopes: string[];
}

export interface ResourceServer {
  audience: string;
  availableScopes: string[];
}

interface TokenExchange {
  trustedIssuer: string;
  mapping: (claims: Record<string, any>) => Record<string, any>;
}

/**
 * A list of applications
 */
export const applications: ResourceServer[] = [
  {
    audience: 'api.submissionstorage-dev.csp-nijmegen.nl',
    availableScopes: ['form-overview', 'submissions', 'submissions:read-own'],
  },
];

/**
 * A map of client ids and secrets
 */
export const clients: Record<string, ClientConfiguration> = {
  '376a1705-651b-4d8a-809e-b7563142ebde': {
    secret: '0f68cf72-75ad-45ed-b7d1-e9cba35694aa',
    authorizations: [
      {
        resourceServer: applications[0],
        allowedScopes: ['form-overview'],
      },
    ],
  },
  '0588239d-3fb8-42af-9f0a-96cbfe199a8e': { //'Mijn Nijmegen'
    secret: 'cf8ac7cf-dea8-414a-b37d-c00813778d41',
    authorizations: [
      {
        resourceServer: applications[0],
        allowedScopes: ['submissions:read-own'],
      },
    ],
    tokenExchanges: [
      {
        trustedIssuer: 'https://authenticatie-accp.nijmegen.nl/broker/sp/oidc',
        mapping: (claims: Record<string, any>): Record<string, any> => {
          const bsn = claims.sub; //TODO: Yivi, eherkenning logic
          return {
            bsn: bsn,
            type: 'person',
          };
        },
      },
    ],
  },
};

export function getKnownScopes() {
  return applications.reduce((scopes: string[], app: ResourceServer) => {
    return [...scopes, ...app.audience];
  }, []);
}

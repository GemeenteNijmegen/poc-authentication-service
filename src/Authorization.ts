
/**
 * Configuration for each client
 */
export interface ClientConfiguration {
  secret: string;
  authorizations: Authorization[];
}

/**
 * Describes an endpoint and posible allowed scopes per client
 */
export interface Authorization {
  application: Application;
  allowedScopes: string[];
}

export interface Application {
  audience: string;
  availableScopes: string[];
}


/**
 * A list of applications
 */
export const applications: Application[] = [
  {
    audience: 'api.submissionstorage-dev.csp-nijmegen.nl',
    availableScopes: ['list-overviews', 'generate-form-overview', 'download-form-overview', 'list-submissions'],
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
        application: applications[0],
        allowedScopes: ['list-overviews', 'generate-form-overview', 'download-form-overview'],
      },
    ],
  },
};

export function getKnownScopes() {
  return applications.reduce((scopes: string[], app: Application) => {
    return [...scopes, ...app.audience];
  }, []);
}
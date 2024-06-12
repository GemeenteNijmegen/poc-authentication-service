import { Authorization, ClientConfiguration } from '../Authorization';


export class Utils {
  /**
   * Parses a basic authentication header
   * @param header
   * @returns client_id and client_secret from basic authentication header
   */
  static parseAuthenticationHeader(header: string) {
    if (!header.startsWith('Basic ')) {
      throw Error('Only basic authentication is supported');
    }
    const decoded = Buffer.from(header.substring(6), 'base64').toString('utf-8');
    const parts = decoded.split(':');
    return {
      client_id: parts[0],
      client_secret: parts[1],
    };
  }

  /**
   * Given an client configuration get all the scopes it is allowed to access.
   * @param configuration
   * @returns
   */
  static scopesFromClientConfiguration(configuration: ClientConfiguration) {
    const unfilteredScopes = configuration.authorizations.reduce((scopes: string[], authorization: Authorization) => {
      return [...scopes, ...authorization.allowedScopes];
    }, []);
    return unfilteredScopes.filter((scope, index) => unfilteredScopes.indexOf(scope) === index);
  }

  /**
   * Given an client configuration get all the audience the client may use the token for.
   * @param configuration
   * @returns
   */
  static audiencesFromClientConfiguration(configuration: ClientConfiguration) {
    const unfilteredAudiences = configuration.authorizations.reduce((audiences: string[], authorization: Authorization) => {
      return [...audiences, authorization.application.audience];
    }, []);
    return unfilteredAudiences.filter((audience, index) => unfilteredAudiences.indexOf(audience) === index);
  }
}
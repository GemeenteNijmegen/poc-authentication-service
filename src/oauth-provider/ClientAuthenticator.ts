import { Client } from './OAuthProvider';
import { TokenRequest } from './OAuthRequest';

export class ClientAuthenticator {
  private readonly clients: Client[];

  constructor(clients: Client[]) {
    this.clients = clients;
  }

  authenticate(_request: TokenRequest) {
    // Find client ID in request

    // Lookup client ID

    // Check if authentication method used matches client auth method

    // Check if secrets match:
    // - JWT singed by right private key (validate by issuer url)
    // - mTLS check if request is signed with right cert
    // - client_credentials check if password matches

    return {
      clientId: '',
      scopes: [] as string[],
    };
  }


}


import { createPrivateKey, randomUUID } from 'crypto';
import { ClientCredentialsFlow } from '../flows/ClientCredentialsFlow';
import { TokenExchangeFlow } from '../flows/TokenExchange';
import { OAuthProvider } from '../OAuthProvider';
import { TokenRequest } from '../OAuthRequest';


export async function example() {
  const oauth = new OAuthProvider({
    issuer: 'https://authentication.sandbox-marnix.csp-nijmegen.nl',
    clients: [
      {
        clientId: 'readClient',
        authenticationMethod: 'client_credentials',
        authenticationData: 'geheim',
        authorizations: [],
      },
    ],
    flows: [
      new ClientCredentialsFlow(),
      new TokenExchangeFlow(),
    ],
    tokenOptions: {
      privateKey: createPrivateKey({
        key: '', // TODO add private key
        format: 'pem',
      }),
      signing: 'RS256',
      token_type: 'jwt',
      keyId: randomUUID(),
    },
    // sessionStore: undefined, // For some flows we need a session store (providing it here allows for custom implementations), default to in memory?
    // tokenStore: undefined, // Used for revocation or introspection of opaque tokens (providing it here allows for custom implementations), default to in memory?
  });

  await oauth.tokenRequest(new TokenRequest({
    method: 'POST',
    headers: {},
    path: '/token',
    requestParameters: {
      client_id: 'readClient',
      client_secret: 'geheim',
    },
  }));

}
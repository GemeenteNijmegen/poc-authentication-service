import * as crypto from 'crypto';
import { SignJWT } from 'jose';
import { TokenOptions } from './OAuthProvider';
export class OAuthTokenGenerator {
  private readonly options: TokenOptions;
  private readonly issuer: string;
  constructor(options: TokenOptions, issuer: string) {
    this.options = options;
    this.issuer = issuer;
  }

  async createToken(clientId: string, scopes: string[]) {
    const now = new Date();
    const exp = new Date();
    exp.setSeconds(now.getSeconds() + (this.options.ttl ?? 3600));
    let customClaims = {};
    if (this.options.tokenHook) {
      customClaims = this.options.tokenHook(customClaims);
    }
    let claims = {
      ...customClaims,
      aud: [
        '',
      ],
      iss: this.issuer,
      iat: Math.floor(now.getTime() / 1000),
      exp: Math.floor(exp.getTime() / 1000),
      sub: clientId,
      scope: scopes.join(' '),
      jti: crypto.randomUUID(),
    };
    const token = new SignJWT(claims);
    token.setProtectedHeader({
      typ: 'JWT',
      alg: this.options.signing,
      kid: this.options.keyId,
    });
    return token.sign(this.options.privateKey);
  }

  async createDelegatedToken() {
    return '';
  }

}
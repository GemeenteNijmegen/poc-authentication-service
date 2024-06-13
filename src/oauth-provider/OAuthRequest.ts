export interface OAuthRequest {
  method: string;
  path: string;
  headers?: Record<string, string>;
  requestParameters?: Record<string, string>;
  bodyParameters?: Record<string, string>;
}

export class AuthorizationRequest {
  readonly contents: OAuthRequest;
  constructor(contents: OAuthRequest) {
    this.contents = contents;
  }
  validate() {

  }
}

export class TokenRequest {
  readonly contents: OAuthRequest;
  constructor(contents: OAuthRequest) {
    this.contents = contents;
  }
  validate() {
    if (this.contents.method !== 'POST') {
      throw Error('Only POST requests are allowed');
    }
    if (this.contents.headers?.['Content-Type'] !== 'application/x-www-form-urlencoded') {
      throw Error('Only requests with content type application/x-www-form-urlencoded are allowed');
    }
    if (!this.contents.bodyParameters && !this.contents.requestParameters) {
      throw Error('No request parameters found');
    }
  }
}
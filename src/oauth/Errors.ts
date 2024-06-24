type Errors = 'invalid_request' | 'invalid_client' | 'invalid_grant' | 'unauthorized_client' | 'unsupported_grant_type' | 'invalid_scope' | 'invalid_target';

export abstract class OAuthError extends Error {
  readonly error: Errors;
  readonly description?: string;
  readonly httpCode: number;

  constructor(error: Errors, description?: string, httpCode: number = 200) {
    super();
    this.error = error;
    this.description = description;
    this.httpCode = httpCode;
  }
}

export class InvalidRequest extends OAuthError {
  constructor(description?: string) {
    super('invalid_request', description, 400);
  }
}

export class InvalidTarget extends OAuthError {
  constructor(description?: string) {
    super('invalid_target', description, 400);
  }
}

export class InvalidClient extends OAuthError {
  constructor(description?: string) {
    super('invalid_client', description, 400);
  }
}

export class InvalidGrant extends OAuthError {
  constructor(description?: string) {
    super('invalid_grant', description, 400);
  }
}

export class UnauthorizedClient extends OAuthError {
  constructor(description?: string) {
    super('unauthorized_client', description, 401);
  }
}

export class UnsupportedGrantType extends OAuthError {
  constructor(description?: string) {
    super('unsupported_grant_type', description, 400);
  }
}

export class InvalidScope extends OAuthError {
  constructor(description?: string) {
    super('invalid_scope', description, 400);
  }
}

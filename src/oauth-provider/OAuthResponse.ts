export interface OAuthResponse {
  code: number;
  headers: Record<string, string>;
}

export interface AuthorizationResponse extends OAuthResponse {}

export interface TokenResponse extends OAuthResponse {
  /**
   * The access token issued by the authorization server.
   */
  access_token: string;
  /**
   * The type of the token issued as described in Section 7.1 (RFC6749). Value is case insensitive.
   */
  token_type: string;
  /**
   * The lifetime in seconds of the access token.  For example, the value "3600" denotes that the
   * access token will expire in one hour from the time the response was generated. If omitted,
   * the authorization server SHOULD provide theexpiration time via other means or document the
   * default value.
   */
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  state?: string;
}
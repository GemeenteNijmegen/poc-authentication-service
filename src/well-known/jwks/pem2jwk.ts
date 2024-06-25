import * as crypto from 'crypto';

export function pemToJwk(pem: string) {
  const publicKey = crypto.createPublicKey(pem);
  const jwk = publicKey.export({
    format: 'jwk',
  });
  // Add key id as a sha256 hash of the public pem file
  jwk.kid = crypto.createHash('sha256').update(pem).digest('hex');
  return jwk;
}
import * as crypto from 'crypto';

export function pemToJwk(certificate: string) {
  const x509 = new crypto.X509Certificate(certificate);
  const publicKey = crypto.createPublicKey(certificate);
  const jwk = publicKey.export({
    format: 'jwk',
  });
  // Add key id
  jwk.kid = x509.fingerprint256.replace(/:/g, '');
  return jwk;
}
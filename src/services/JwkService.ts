import * as crypto from 'crypto';
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class JwkService {

  private readonly client: S3Client;
  private readonly bucketName: string;
  constructor(client: S3Client, bucketName: string) {
    this.client = client;
    this.bucketName = bucketName;
  }

  async getJwks() {
    let jwks = { keys: [] as any[] };

    // List all public keys in the bucket
    const publicKeyObjects = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: 'public-keys/',
    }));

    if (!publicKeyObjects.Contents) {
      throw Error('No public keys found in s3 buckets...');
    }

    // Get all pems
    const promises = publicKeyObjects.Contents.map(obj => {
      return this.client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: obj.Key,
      }));
    });
    const publicKeys = await Promise.all(promises);

    // Build the jwks response
    for (const key of publicKeys) {
      if (key.Body) {
        const jwk = this.pemToJwk(await key.Body.transformToString());
        jwks.keys.push(jwk);
      }
    }
  }


  async generateNewKeyPair() {
    // New RSA keypair
    const keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096, // Min 2028 in JWT RFC.
      publicKeyEncoding: { // TODO look in to how we can switch key sizes around (private key > public key) for performance reasons and easy validation
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Create a timestamp
    const timestamp = new Date().toISOString().substring(0, 10);

    // Store the public key
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `public-keys/${timestamp}-public.pem`,
      Body: keys.publicKey.toString(),
    }));

    // Store the private key
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `private-keys/${timestamp}-private.pem`,
      Body: keys.publicKey.toString(),
    }));

  }


  async getActiveSigningKeyAndKeyId() {

    const keys = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: 'private-keys',
    }));

    // Sort by key
    const sorted = keys.Contents?.sort((a, b) => {
      if (!a?.Key || !b?.Key) {
        return 0;
      }
      return b.Key.localeCompare(a.Key); // Sort by timestamp desc
    });

    // Get fist (newest key)
    if (!sorted || sorted.length == 0) {
      throw Error('No private signing keys found');
    }

    // Decuct public key path
    const privateKeyKey = sorted[0].Key;
    const publicKeyKey = privateKeyKey?.replace(/private/g, 'public');

    // Load the private key
    const privateKeyPemObject = await this.client.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: privateKeyKey,
    }));
    const privateKeyPem = await privateKeyPemObject.Body?.transformToString();
    if (!privateKeyPem) {
      throw Error('No private key PEM could be loaded.');
    }

    // Load the public key and calculate the Key ID (kid)
    const publicKeyPemObject = await this.client.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: publicKeyKey,
    }));
    const publicKeyPem = await publicKeyPemObject.Body?.transformToString();
    if (!publicKeyPem) {
      throw Error('No Public key PEM could be loaded.');
    }
    const kid = crypto.createHash('sha256').update(publicKeyPem).digest('hex');

    return {
      privateKey: privateKeyPem,
      kid: kid,
    };

  }

  private pemToJwk(pem: string) {
    const publicKey = crypto.createPublicKey(pem);
    const jwk = publicKey.export({
      format: 'jwk',
    });
    // Add key id as a sha256 hash of the public pem file
    jwk.kid = crypto.createHash('sha256').update(pem).digest('hex');
    return jwk;
  }

}
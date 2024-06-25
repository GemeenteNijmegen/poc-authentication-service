import * as crypto from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export async function handler() {
  const s3 = new S3Client();

  const keys = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
      passphrase: '',
    },
  });

  const timestamp = new Date().toISOString().substring(0, 10);

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: `public-keys/${timestamp}-public.pem`,
    Body: keys.publicKey.toString(),
  }));

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: `private-keys/${timestamp}-private.pem`,
    Body: keys.privateKey.toString(),
  }));

}

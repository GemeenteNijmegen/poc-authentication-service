import { S3Client } from '@aws-sdk/client-s3';
import { JwkService } from '../services/JwkService';

export async function handler() {
  const jwkService = new JwkService(new S3Client(), process.env.BUCKET_NAME!);
  await jwkService.generateNewKeyPair();
}
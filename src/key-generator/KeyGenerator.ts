import { Duration, aws_events_targets } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { KeyGeneratorFunction } from './key-generator-function';

interface KeyGeneratorOptions {
  renewalSchedule: Schedule;
  keyRetention: Duration;
}

export class KeyGenerator extends Construct {

  readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: KeyGeneratorOptions) {
    super(scope, id);

    this.bucket = this.keyBucket(props);
    this.keyGeneration(props);

  }

  keyBucket(props: KeyGeneratorOptions) {
    return new Bucket(this, 'bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      lifecycleRules: [
        {
          expiration: props.keyRetention,
        },
      ],
    });
  }

  keyGeneration(props: KeyGeneratorOptions) {
    const keyGeneratorFunction = new KeyGeneratorFunction(this, 'function', {
      environment: {
        BUCKET_NAME: this.bucket.bucketName,
      },
    });
    this.bucket.grantWrite(keyGeneratorFunction);

    new Rule(this, 'schedule', {
      description: 'Trigger key generation lambda for rotating keys',
      schedule: props.renewalSchedule,
      targets: [
        new aws_events_targets.LambdaFunction(keyGeneratorFunction),
      ],
    });
  }

}
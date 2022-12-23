import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
  region: 'ap-northeast-2',
});

const BucketName = process.env.BUCKET_NAME;

const commandGetObject = (filePath: string) =>
  new GetObjectCommand({
    Bucket: BucketName,
    Key: filePath,
  });
const commandPutObject = (Key: string, file: string | Uint8Array | Buffer, ContentType?: string) =>
  new PutObjectCommand({
    Bucket: BucketName,
    Key,
    ContentType,
    Body: file,
  });

export const getObject = (filePath: string) => client.send(commandGetObject(filePath));
export const putObject = (...args: Parameters<typeof commandPutObject>) =>
  client.send(commandPutObject(...args));

export const generateGetURL = (filePath: string) =>
  getSignedUrl(client, commandGetObject(filePath), { expiresIn: 3600 });

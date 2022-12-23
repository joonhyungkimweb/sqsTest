import { Readable } from 'stream';

export const streamToBuffer = (stream: Readable) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

export const streamToJSONObject = async (stream: Readable) =>
  JSON.parse((await streamToBuffer(stream)).toString('utf-8'));

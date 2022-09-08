import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'ap-northeast-2',
});

const TABLE_NAME = process.env.TABLE_NAME;

const commandUpdate = (
  email: string,
  trainingSeq: string,
  status: 'training' | 'finished' | 'error',
  keys: Record<string, string>,
  values: Record<string, AttributeValue>,
  setExpression: string
) =>
  new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      email: {
        S: email,
      },
      trainingSeq: {
        S: trainingSeq,
      },
    },
    ExpressionAttributeNames: { '#status': 'status', ...keys },
    ExpressionAttributeValues: { ':status': { S: status }, ...values },
    UpdateExpression: `SET #status = :status, ${setExpression}`,
  });

export const onTraining = (
  email: string,
  trainingSeq: string,
  history: Record<string, AttributeValue>
) =>
  client.send(
    commandUpdate(
      email,
      trainingSeq,
      'training',
      { '#history': 'history' },
      { ':history': { L: [{ M: history }] } },
      '#history = list_append(#history, :history)'
    )
  );

export const onFinish = (
  email: string,
  trainingSeq: string,
  modelPath: string,
  weightsPath: string
) =>
  client.send(
    commandUpdate(
      email,
      trainingSeq,
      'finished',
      { '#modelPath': 'modelPath', '#weightsPath': 'weightsPath' },
      {
        ':modelPath': { S: modelPath },
        ':weightsPath': { S: weightsPath },
      },
      '#modelPath = :modelPath, #weightsPath = :weightsPath'
    )
  );

export const onError = (email: string, trainingSeq: string, errorMessage: string) =>
  client.send(
    commandUpdate(
      email,
      trainingSeq,
      'error',
      { '#errorMessage': 'errorMessage' },
      {
        ':errorMessage': { S: errorMessage },
      },
      '#errorMessage = :errorMessage'
    )
  );

import {
  DynamoDBClient,
  UpdateItemCommand,
  AttributeValue,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'ap-northeast-2',
});

const TABLE_NAME = process.env.TABLE_NAME;

const commandUpdate = (
  trainingSeq: string,
  status: 'training' | 'finished' | 'error',
  keys?: Record<string, string>,
  values?: Record<string, AttributeValue>,
  setExpression?: string
) =>
  new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      trainingSeq: {
        S: trainingSeq,
      },
    },
    ExpressionAttributeNames: { '#status': 'status', ...keys },
    ExpressionAttributeValues: { ':status': { S: status }, ...values },
    UpdateExpression: `SET #status = :status, ${setExpression}`,
  });

export const getParams = (instanceId: string) =>
  client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      ExpressionAttributeNames: { '#instanceId': 'instanceId' },
      ExpressionAttributeValues: { ':instanceId': { S: instanceId } },
      FilterExpression: '#instanceId = :instanceId',
    })
  );

export const onTraining = (
  trainingSeq: string,
  history: Record<string, AttributeValue>,
  files: Record<string, AttributeValue>,
  epochsDone: number
) =>
  client.send(
    commandUpdate(
      trainingSeq,
      'training',
      { '#history': 'history', '#files': 'files', '#epochsDone': 'epochsDone' },
      {
        ':history': { L: [{ M: history }] },
        ':files': { L: [{ M: files }] },
        ':epochsDone': { N: `${epochsDone}` },
      },
      '#history = list_append(#history, :history), #files = list_append(#files, :files), #epochsDone = :epochsDone'
    )
  );

export const onFinish = (trainingSeq: string) =>
  client.send(
    commandUpdate(
      trainingSeq,
      'finished',
      { '#finishTime': 'finishTime' },
      {
        ':finishTime': { N: `${+new Date()}` },
      },
      '#finishTime = :finishTime'
    )
  );

export const onError = (trainingSeq: string, errorMessage: string) =>
  client.send(
    commandUpdate(
      trainingSeq,
      'error',
      { '#errorMessage': 'errorMessage' },
      {
        ':errorMessage': { S: errorMessage },
      },
      '#errorMessage = :errorMessage'
    )
  );

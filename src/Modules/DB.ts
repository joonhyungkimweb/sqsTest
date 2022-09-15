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
  instanceId: string,
  status: 'training' | 'finished' | 'error',
  keys?: Record<string, string>,
  values?: Record<string, AttributeValue>,
  setExpression?: string
) =>
  new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      instanceId: {
        S: instanceId,
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
  instanceId: string,
  history: Record<string, AttributeValue>,
  files: Record<string, AttributeValue>
) =>
  client.send(
    commandUpdate(
      instanceId,
      'training',
      { '#history': 'history', '#files': 'files' },
      { ':history': { L: [{ M: history }] }, ':files': { L: [{ M: files }] } },
      '#history = list_append(#history, :history), #files = list_append(#files, :files)'
    )
  );

export const onFinish = (instanceId: string) =>
  client.send(
    commandUpdate(
      instanceId,
      'finished',
      { '#finishTime': 'finishTime' },
      {
        ':finishTime': { N: `${+new Date()}` },
      },
      '#finishTime = :finishTime'
    )
  );

export const onError = (instanceId: string, errorMessage: string) =>
  client.send(
    commandUpdate(
      instanceId,
      'error',
      { '#errorMessage': 'errorMessage' },
      {
        ':errorMessage': { S: errorMessage },
      },
      '#errorMessage = :errorMessage'
    )
  );

import { getParams } from './DB';
interface TrainingParams {
  instanceId: string;
  userId: string;
  modelName: string;
  datasetPath: string;
  modelPath: string;
  weightsPath: string;
  xColumns: number[];
  yColumns: number[];
  optimizer: string;
  loss: string;
  metrics: string;
  batchSize: number;
  epochs: number;
  shuffle: boolean;
  validationSplit: number;
  trainingSeq: string;
}

export const getTrainingParams = async (targetId: string): Promise<TrainingParams> => {
  const { Items } = await getParams(targetId);
  if (Items == null) throw new Error('no Message');
  const [
    {
      modelPath: { S: modelPath },
      datasetPath: { S: datasetPath },
      xColumns: { L: xColumns },
      yColumns: { L: yColumns },
      loss: { S: loss },
      weightsPath: { S: weightsPath },
      batchSize: { N: batchSize },
      userId: { S: userId },
      epochs: { N: epochs },
      validationSplit: { N: validationSplit },
      instanceId: { S: instanceId },
      metrics: { S: metrics },
      modelName: { S: modelName },
      optimizer: { S: optimizer },
      shuffle: { BOOL: shuffle },
      trainingSeq: { S: trainingSeq },
    },
  ] = Items;

  return {
    instanceId: instanceId!,
    userId: userId!,
    modelName: modelName!,
    datasetPath: datasetPath!,
    modelPath: modelPath!,
    weightsPath: weightsPath!,
    xColumns: xColumns!.map(({ N }) => +N!),
    yColumns: yColumns!.map(({ N }) => +N!),
    optimizer: optimizer!,
    loss: loss!,
    metrics: metrics!,
    batchSize: +batchSize!,
    epochs: +epochs!,
    shuffle: shuffle!,
    validationSplit: +validationSplit!,
    trainingSeq: trainingSeq!,
  };
};

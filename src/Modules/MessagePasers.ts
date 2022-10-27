import { getParams } from './DB';
interface TrainingParams {
  instanceId: string;
  trainingSeq: string;
  userId: string;
  modelName: string;
  datasetPath: string;
  modelPath: string;
  weightsPath: string;
  optimizer: string;
  loss: string;
  metrics: string;
  learningRate: number;
  epochs: number;
  batchSize: number;
  shuffle: boolean;
  validationSplit: number;
  xColumns: number[];
  yColumns: number[];
}

export const getTrainingParams = async (targetId: string): Promise<TrainingParams> => {
  const { Items } = await getParams(targetId);
  if (Items == null) throw new Error('no Message');
  const [
    {
      instanceId: { S: instanceId },
      trainingSeq: { S: trainingSeq },
      userId: { S: userId },
      modelName: { S: modelName },
      datasetPath: { S: datasetPath },
      modelPath: { S: modelPath },
      weightsPath: { S: weightsPath },
      optimizer: { S: optimizer },
      loss: { S: loss },
      metrics: { S: metrics },
      learningRate: { N: learningRate },
      epochs: { N: epochs },
      batchSize: { N: batchSize },
      shuffle: { BOOL: shuffle },
      validationSplit: { N: validationSplit },
      xColumns: { L: xColumns },
      yColumns: { L: yColumns },
    },
  ] = Items;

  return {
    instanceId: instanceId!,
    trainingSeq: trainingSeq!,
    userId: userId!,
    modelName: modelName!,
    datasetPath: datasetPath!,
    modelPath: modelPath!,
    weightsPath: weightsPath!,
    optimizer: optimizer!,
    loss: loss!,
    metrics: metrics!,
    learningRate: +learningRate!,
    epochs: +epochs!,
    batchSize: +batchSize!,
    shuffle: shuffle!,
    validationSplit: +validationSplit!,
    xColumns: xColumns!.map(({ N }) => +N!),
    yColumns: yColumns!.map(({ N }) => +N!),
  };
};

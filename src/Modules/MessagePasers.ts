import { deleteMessage, getMessage } from './MessageQueue';

interface TrainingParams {
  userId: string;
  trainingSeq: string;
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
}

export const getTrainingParams = async (): Promise<{
  params: TrainingParams;
  clearMessage: () => void;
}> => {
  const { Messages } = await getMessage();
  if (Messages == null) throw new Error('no Message');
  const [{ Body, ReceiptHandle }] = Messages;
  if (Body == null) throw new Error('no Message');
  return {
    params: JSON.parse(Body),
    clearMessage: () => deleteMessage(ReceiptHandle!),
  };
};

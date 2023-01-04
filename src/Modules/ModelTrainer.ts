import { Optimizer, Tensor, dispose, train } from '@tensorflow/tfjs-node-gpu';
import { LoadModel } from './ModelLoader';
import { startTrainningProcess } from './APICalls';
import { modelTrainingCallBacks } from './ModelTrainingCallBacks';
import { TfjsRequestParameters } from '../@types/TrainingParams';

const optimizers: { [key: string]: (learningRate: number) => Optimizer } = {
  ADAM: train.adam,
  SGD: train.sgd,
  ADAGRAD: train.adagrad,
  ADADELTA: train.adadelta,
  ADAMAX: train.adamax,
  RMSPROP: train.rmsprop,
};

export const compileOptimizer = (optimzer: string, learningRate: number) =>
  optimizers[optimzer](learningRate);

export const trainModel = async (
  params: TfjsRequestParameters,
  trainingDataset: {
    xs: Tensor | Tensor[];
    ys: Tensor | Tensor[];
  }
) => {
  const model = await LoadModel(params.modelPath, params.weightsPath);
  const optimizer = compileOptimizer(params.optimizer, params.learningRate);
  const { xs, ys } = trainingDataset;

  await startTrainningProcess(params.trainingId);

  model.compile({
    optimizer,
    loss: params.loss,
    metrics: params.metrics,
  });

  await model.fit(xs, ys, {
    batchSize: params.batchSize,
    epochs: params.epochs,
    shuffle: params.shuffle,
    validationSplit: params.validationSplit,
    callbacks: modelTrainingCallBacks(params.trainingId, params.userId, model),
  });

  model.dispose();
  optimizer.dispose();
  dispose(trainingDataset);
};

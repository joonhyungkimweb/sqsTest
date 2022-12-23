import {
  LayersModel,
  ModelCompileArgs,
  ModelFitArgs,
  Optimizer,
  Tensor,
  train,
} from '@tensorflow/tfjs-node-gpu';

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
  {
    xs,
    ys,
  }: {
    xs: Tensor | Tensor[];
    ys: Tensor | Tensor[];
  },
  model: LayersModel,
  compileConfig: ModelCompileArgs,
  trainConfig: ModelFitArgs
) => {
  model.compile(compileConfig);
  return model.fit(xs, ys, trainConfig);
};

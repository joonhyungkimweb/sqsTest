import {
  LayersModel,
  ModelCompileArgs,
  ModelFitArgs,
  Tensor,
  train,
} from '@tensorflow/tfjs-node-gpu';

const optimizers = {
  Adam: train.adam,
  SGD: train.sgd,
  Adagrad: train.adagrad,
  Adadelta: train.adadelta,
  Adamax: train.adamax,
  RMSProp: train.rmsprop,
};

export const compileOptimizer = (optimzer: keyof typeof optimizers, learningRate: number) =>
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
  await model.fit(xs, ys, trainConfig);
};

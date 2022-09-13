import { LayersModel, ModelCompileArgs, ModelFitArgs, Tensor } from '@tensorflow/tfjs-node-gpu';

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

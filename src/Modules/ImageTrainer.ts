import { dispose } from '@tensorflow/tfjs-node-gpu';
import { TfjsParametersWithDataType } from '../@types/TrainingParams';
import { startPreprocessing, startTrainningProcess } from './APICalls';
import { loadAndProcessImageData } from './ImageProcessor';
import { LoadModel } from './ModelLoader';
import { compileOptimizer, trainModel } from './ModelTrainer';
import { modelTrainingCallBacks } from './ModelTrainingCallBacks';

export const trainImageModel = async (params: TfjsParametersWithDataType<'IMAGE'>) => {
  await startPreprocessing(params.trainingId);
  const { width, height, channel, normalize } = params.trainingOptions;
  const trainingDataset = await loadAndProcessImageData(
    params.datasetPath,
    width,
    height,
    channel,
    normalize
  );
  const model = await LoadModel(params.modelPath, params.weightsPath);
  const optimizer = compileOptimizer(params.optimizer, params.learningRate);
  await startTrainningProcess(params.trainingId);
  await trainModel(
    trainingDataset,
    model,
    {
      optimizer,
      loss: params.loss,
      metrics: params.metrics,
    },
    {
      batchSize: params.batchSize,
      epochs: params.epochs,
      shuffle: params.shuffle,
      validationSplit: params.validationSplit,
      callbacks: modelTrainingCallBacks(params.trainingId, params.userId, model),
    }
  );
  model.dispose();
  optimizer.dispose();
  dispose(trainingDataset);
};

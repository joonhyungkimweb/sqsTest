import { dispose } from '@tensorflow/tfjs-node-gpu';
import { TfjsParametersWithDataType } from '../@types/TrainingParams';
import { errorOnTrainingSession, startPreprocessing, startTrainningProcess } from './APICalls';
import { loadAndProcessCSVData } from './DataProcessor';
import { LoadModel } from './ModelLoader';
import { compileOptimizer, trainModel } from './ModelTrainer';
import { epochEndHandler, finishHandler } from './ModelTrainingCallBacks';

export const trainCSVModel = async (params: TfjsParametersWithDataType<'TEXT'>) => {
  await startPreprocessing(params.trainingId);
  const { xColumns, yColumns } = params.trainingOptions;
  const trainingDataset = await loadAndProcessCSVData(params.datasetPath, xColumns, yColumns);
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
      callbacks: {
        onEpochEnd: epochEndHandler(params.trainingId, params.userId, model),
        onTrainEnd: finishHandler(params.trainingId),
      },
    }
  );
  model.dispose();
  optimizer.dispose();
  dispose(trainingDataset);
};

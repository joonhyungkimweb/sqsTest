import { dispose } from '@tensorflow/tfjs-node-gpu';
import { ImageParams, TfjsParametersWithDataType } from '../@types/TrainingParams';
import { errorOnTrainingSession, startPreprocessing, startTrainningProcess } from './APICalls';
import { loadAndProcessImageData } from './ImageProcessor';
import { LoadModel } from './ModelLoader';
import { createModelSaver } from './ModelSaver';
import { compileOptimizer, trainModel } from './ModelTrainer';
import { epochEndHandler, finishHandler } from './ModelTrainingCallBacks';

export const trainImageModel = async (id: number, params: TfjsParametersWithDataType<'IMAGE'>) => {
  try {
    await startPreprocessing(id);
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
    await startTrainningProcess(id);
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
          onEpochEnd: epochEndHandler(id, params.userId, model),
          onTrainEnd: finishHandler(id),
        },
      }
    );
    model.dispose();
    optimizer.dispose();
    dispose(trainingDataset);
  } catch (error) {
    console.error(error);
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    await errorOnTrainingSession(id, message);
  }
};

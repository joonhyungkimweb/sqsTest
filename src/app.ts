import { UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { loadAndProcessCSVData } from './Modules/DataProcessor';
import { onError, onFinish, onTraining } from './Modules/DB';
import { getTrainingParams } from './Modules/MessagePasers';
import { LoadModel } from './Modules/ModelLoader';
import { createModelSaver } from './Modules/ModelSaver';
import { trainModel } from './Modules/ModelTrainer';
import { terminateInstance } from './Modules/TeminatEC2';

const start = async () => {
  try {
    const { params, clearMessage } = await getTrainingParams();
    try {
      const trainingDataset = await loadAndProcessCSVData(
        params.datasetPath,
        params.xColumns,
        params.yColumns
      );
      const model = await LoadModel(params.modelPath, params.weightsPath);
      const result = await trainModel(
        trainingDataset,
        model,
        {
          optimizer: params.optimizer,
          loss: params.loss,
          metrics: params.metrics,
        },
        {
          batchSize: params.batchSize,
          epochs: params.epochs,
          shuffle: params.shuffle,
          validationSplit: params.validationSplit,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              onTraining(
                params.userId,
                params.trainingSeq,
                Object.entries(logs!).reduce(
                  (acc, [key, value]) => ({ ...acc, [key]: { S: `${value}` } }),
                  {}
                )
              );
            },
            onTrainEnd: () => {
              onFinish(
                params.userId,
                params.trainingSeq,
                `${params.modelName}.json`,
                `${params.modelName}.weights.bin`
              );
            },
          },
        }
      );
      await model.save(createModelSaver(params.userId, params.modelName));
    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      onError(params.userId, params.trainingSeq, message);
    }
    clearMessage();
  } catch (err) {
    console.error(err);
    return;
  } finally {
    terminateInstance();
  }
};

start();

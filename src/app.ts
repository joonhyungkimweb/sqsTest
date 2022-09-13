import { loadAndProcessCSVData } from './Modules/DataProcessor';
import { onStart, onError, onFinish, onTraining } from './Modules/DB';
import { getInstanceId } from './Modules/GetInstanceID';
import { getTrainingParams } from './Modules/MessagePasers';
import { LoadModel } from './Modules/ModelLoader';
import { createModelSaver } from './Modules/ModelSaver';
import { trainModel } from './Modules/ModelTrainer';
import { fetchDelete } from './Modules/TeminatEC2';

const start = async () => {
  const instanceId = await getInstanceId();
  try {
    const { params, clearMessage } = await getTrainingParams();
    await onStart(params.userId, params.trainingSeq, instanceId);
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
            onEpochEnd: async (epoch, logs) => {
              await onTraining(
                params.userId,
                params.trainingSeq,
                Object.entries(logs!).reduce(
                  (acc, [key, value]) => ({ ...acc, [key]: { N: `${value}` } }),
                  {}
                )
              );
              await model.save(createModelSaver(params.userId, params.modelName));
            },
            onTrainEnd: async () => {
              await onFinish(
                params.userId,
                params.trainingSeq,
                `${params.modelName}.json`,
                `${params.modelName}.weights.bin`
              );
            },
          },
        }
      );
    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      await onError(params.userId, params.trainingSeq, message);
    } finally {
      await clearMessage();
    }
  } catch (err) {
    console.error(err);
    return;
  } finally {
    fetchDelete(instanceId);
  }
};

start();

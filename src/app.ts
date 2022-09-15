import { loadAndProcessCSVData } from './Modules/DataProcessor';
import { onError, onFinish, onTraining } from './Modules/DB';
import { getInstanceId } from './Modules/GetInstanceID';
import { getTrainingParams } from './Modules/MessagePasers';
import { LoadModel } from './Modules/ModelLoader';
import { createModelSaver } from './Modules/ModelSaver';
import { trainModel } from './Modules/ModelTrainer';
import { fetchDelete } from './Modules/TeminatEC2';

const start = async () => {
  const instanceId = await getInstanceId();
  try {
    const params = await getTrainingParams(instanceId);

    if (params == null) throw new Error('no message');

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
            const prefix = `${params.userId}/trained-models/${params.trainingSeq}`;
            const modelFileName = `${params.modelName}-epoch${epoch}`;

            await model.save(createModelSaver(prefix, modelFileName));

            await onTraining(
              instanceId,
              Object.entries(logs!).reduce(
                (acc, [key, value]) => ({ ...acc, [key]: { N: `${value}` } }),
                {}
              ),
              {
                modelPath: {
                  S: `${prefix}/${modelFileName}.json`,
                },
                weightsPath: {
                  S: `${prefix}/${modelFileName}.weights.bin`,
                },
              }
            );
          },
          onTrainEnd: async () => {
            await onFinish(instanceId);
          },
        },
      }
    );
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    await onError(instanceId, message);
  } finally {
    fetchDelete(instanceId);
  }
};

start();

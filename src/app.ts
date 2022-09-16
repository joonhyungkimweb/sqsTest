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
  let trainingSeq: string | null = null;

  try {
    const params = await getTrainingParams(instanceId);

    trainingSeq = params.trainingSeq;

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
              params.trainingSeq,
              Object.entries(logs!).reduce(
                (acc, [key, value]) => ({ ...acc, [key]: { N: `${value}` } }),
                {}
              ),
              {
                modelPath: {
                  S: `${modelFileName}.json`,
                },
                weightsPath: {
                  S: `${modelFileName}.weights.bin`,
                },
              },
              epoch + 1
            );
          },
          onTrainEnd: async () => {
            await onFinish(params.trainingSeq);
          },
        },
      }
    );
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    if (trainingSeq == null) return;
    await onError(trainingSeq, message);
  } finally {
    fetchDelete(instanceId);
  }
};

start();

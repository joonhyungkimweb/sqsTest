import { loadAndProcessCSVData } from './Modules/DataProcessor';
import { onTraining } from './Modules/DB';
import { getTrainingParams } from './Modules/MessagePasers';
import { LoadModel } from './Modules/ModelLoader';
import { createModelSaver } from './Modules/ModelSaver';
import { trainModel } from './Modules/ModelTrainer';
import { terminateInstance } from './Modules/TeminatEC2';

const start = async () => {
  try {
    const { params, clearMessage } = await getTrainingParams();
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
                (acc, [key, value]) => ({ ...acc, [key]: { S: `${value}` } }),
                {}
              )
            );
          },
        },
      }
    );
    await model.save(createModelSaver(params.userId, params.trainingSeq, params.modelName));
    clearMessage();
  } catch (err) {
    console.error(err);
    return;
  } finally {
    terminateInstance();
  }
};

start();

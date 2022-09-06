import { loadAndProcessCSVData } from './Modules/DataProcessor';
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
      }
    );
    await model.save(createModelSaver(params.userId, params.modelName));
    clearMessage();
  } catch (err) {
    console.error(err);
    return;
  } finally {
    terminateInstance();
  }
};

start();

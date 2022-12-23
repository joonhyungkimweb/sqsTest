import { CustomCallback, LayersModel } from '@tensorflow/tfjs-node-gpu';
import path from 'path';
import { v4 } from 'uuid';
import { finishTrainingSession, updateEpochResult } from './APICalls';
import { createModelSaver } from './ModelSaver';

export const epochEndHandler =
  (trainingId: number, userId: string, model: LayersModel): CustomCallback['onEpochEnd'] =>
  async (epoch, logs) => {
    const modelPath = `${userId}/${v4()}.json`;
    const weightsPath = `${userId}/${v4()}.weights.bin`;
    await model.save(createModelSaver(modelPath, weightsPath));

    await updateEpochResult(trainingId, {
      epochsDone: epoch + 1,
      modelFile: {
        fileName: path.basename(modelPath),
        filePath: modelPath,
        fileSize: 0,
      },
      weightsFile: {
        fileName: path.basename(weightsPath),
        filePath: weightsPath,
        fileSize: 0,
      },
      history: Object.entries(logs || []).reduce(
        (acc, [key, value]) => ({
          ...acc,
          ...(key === 'loss' && { loss: value as number }),
          ...(key === 'val_loss' && { valLoss: value as number }),
          ...(!key.startsWith('val_') && key !== 'loss' && { subMetric: value as number }),
          ...(key.startsWith('val_') && key !== 'val_loss' && { valSubMetric: value as number }),
        }),
        { loss: (logs?.loss as number) || 0 }
      ),
    });
  };

export const finishHandler =
  (trainingId: number): CustomCallback['onTrainEnd'] =>
  async () => {
    await finishTrainingSession(trainingId);
  };

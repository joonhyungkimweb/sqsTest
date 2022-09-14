import { io } from '@tensorflow/tfjs-core';
import { putObject } from './Storage';

export const createModelSaver = (
  userId: string,
  trainingseq: string,
  modelName: string,
  epoch: number
): io.IOHandler => ({
  save: async (modelArtifacts) => {
    const prefix = `${userId}/trained-models/${trainingseq}`;
    const modelFileName = `${modelName}-epoch${epoch}`;
    const modelPath = `${prefix}/${modelFileName}.json`;
    const weightsPath = `${prefix}/${modelFileName}.weights.bin`;

    await putObject(
      modelPath,
      JSON.stringify({
        ...modelArtifacts,
        weightsManifest: [
          {
            paths: [`./${modelFileName}.weights.bin`],
            weights: modelArtifacts.weightSpecs,
          },
        ],
      }),
      'application/json'
    );

    if (modelArtifacts.weightData != null) {
      await putObject(
        weightsPath,
        Buffer.from(modelArtifacts.weightData),
        'application/octet-stream'
      );
    }

    return {
      modelArtifactsInfo: {
        dateSaved: new Date(),
        modelTopologyType: 'JSON',
      },
    };
  },
});

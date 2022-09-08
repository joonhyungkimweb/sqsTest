import { io } from '@tensorflow/tfjs-core';
import { onFinish } from './DB';
import { putObject } from './Storage';

export const createModelSaver = (
  userId: string,
  trainingSeq: string,
  modelName: string
): io.IOHandler => ({
  save: async (modelArtifacts) => {
    const modelPath = `${userId}/trained-models/${modelName}.json`;
    const weightsPath = `${userId}/trained-models/${modelName}.weights.bin`;

    await putObject(
      modelPath,
      JSON.stringify({
        ...modelArtifacts,
        weightsManifest: [
          {
            paths: [`./${modelName}.weights.bin`],
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

    await onFinish(userId, trainingSeq, modelPath, weightsPath);

    return {
      modelArtifactsInfo: {
        dateSaved: new Date(),
        modelTopologyType: 'JSON',
      },
    };
  },
});

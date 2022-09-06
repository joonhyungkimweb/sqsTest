import { io } from '@tensorflow/tfjs-core';
import { putObject } from './Storage';

export const createModelSaver = (userId: string, modelName: string): io.IOHandler => ({
  save: async (modelArtifacts) => {
    await putObject(
      `${userId}/trained-models/${modelName}.json`,
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
        `${userId}/trained-models/${modelName}.weights.bin`,
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

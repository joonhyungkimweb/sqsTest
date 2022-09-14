import { io } from '@tensorflow/tfjs-core';
import { putObject } from './Storage';

export const createModelSaver = (prefix: string, modelFileName: string): io.IOHandler => ({
  save: async (modelArtifacts) => {
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

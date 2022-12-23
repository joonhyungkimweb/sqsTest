import { io } from '@tensorflow/tfjs-core';
import { putObject } from './Storage';
import path from 'path';

export const createModelSaver = (modelPath: string, weightsPath: string): io.IOHandler => ({
  save: async (modelArtifacts) => {
    await putObject(
      modelPath,
      JSON.stringify({
        ...modelArtifacts,
        weightsManifest: [
          {
            paths: [path.basename(weightsPath)],
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

import { io as coreIo } from '@tensorflow/tfjs-core';
import { io, loadLayersModel, serialization } from '@tensorflow/tfjs-node-gpu';
import { Readable } from 'stream';
import { graphModelLayerFactory } from './GraphModelLayer';
import { getObject } from './Storage';
import { streamToJSONObject, streamToBuffer } from './streamConverter';

interface ModelJSON extends coreIo.ModelJSON {
  modelTopology: {
    config: {
      layers: {
        class_name: string;
        config: { model_url: string; from_tfhub: boolean; model_name: string };
      }[];
    };
  };
}

export const generateModelHandler = (
  modelJSON: ModelJSON,
  weightsFiles: Buffer[]
): coreIo.IOHandler => {
  return {
    load: async () => {
      const graphModelLayerClasses = modelJSON.modelTopology.config.layers
        .filter(({ class_name }) => class_name.includes('GraphModel'))
        .map(async ({ config: { model_url, from_tfhub, model_name } }) => {
          serialization.registerClass(
            await graphModelLayerFactory(model_name, model_url, from_tfhub)
          );
        });

      await Promise.all(graphModelLayerClasses);

      const weightData = io.concatenateArrayBuffers(
        weightsFiles.map((buffer) => new Uint8Array(buffer).buffer)
      );

      const weightSpecs = modelJSON.weightsManifest.reduce(
        (acc, { weights }) => [...acc, ...weights],
        [] as coreIo.WeightsManifestEntry[]
      );

      return io.getModelArtifactsForJSONSync(modelJSON, weightSpecs, weightData);
    },
  };
};

export const LoadModel = async (modelPath: string, weightPath: string) => {
  const { Body: modelBody } = await getObject(modelPath);
  const modelJSON = await streamToJSONObject(modelBody as Readable);
  const { Body: weightsBody } = await getObject(weightPath);
  const weightsFiles = await streamToBuffer(weightsBody as Readable);
  return loadLayersModel(await generateModelHandler(modelJSON, [weightsFiles]));
};

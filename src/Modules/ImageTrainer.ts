import { TfjsParametersWithDataType } from '../@types/TrainingParams';
import { startPreprocessing } from './APICalls';
import { loadAndProcessImageData } from './ImageProcessor';
import { trainModel } from './ModelTrainer';

export const trainImageModel = async (params: TfjsParametersWithDataType<'IMAGE'>) => {
  await startPreprocessing(params.trainingId);
  const { width, height, channel, normalize } = params.trainingOptions;
  const trainingDataset = await loadAndProcessImageData(
    params.datasetPath,
    width,
    height,
    channel,
    normalize
  );
  await trainModel(params, trainingDataset);
};

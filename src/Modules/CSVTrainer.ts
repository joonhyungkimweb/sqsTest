import { TfjsParametersWithDataType } from '../@types/TrainingParams';
import { startPreprocessing, startTrainningProcess } from './APICalls';
import { loadAndProcessCSVData } from './DataProcessor';
import { trainModel } from './ModelTrainer';

export const trainCSVModel = async (params: TfjsParametersWithDataType<'TEXT'>) => {
  await startPreprocessing(params.trainingId);
  const { xColumns, yColumns } = params.trainingOptions;
  const trainingDataset = await loadAndProcessCSVData(params.datasetPath, xColumns, yColumns);

  await trainModel(params, trainingDataset);
};

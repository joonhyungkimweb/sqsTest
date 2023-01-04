import { TfjsParametersWithDataType, TfjsRequestParameters } from '../@types/TrainingParams';
import { startPreprocessing } from './APICalls';
import { loadAndProcessCSVData } from './DataProcessor';
import { loadAndProcessImageData } from './ImageProcessor';

const isText = (params: TfjsRequestParameters): params is TfjsParametersWithDataType<'TEXT'> =>
  params.dataType === 'TEXT';

const isImage = (params: TfjsRequestParameters): params is TfjsParametersWithDataType<'IMAGE'> =>
  params.dataType === 'IMAGE';

export const preprocessDataset = async (params: TfjsRequestParameters) => {
  await startPreprocessing(params.trainingId);

  if (isText(params)) {
    const {
      trainingOptions: { xColumns, yColumns },
      datasetPath,
    } = params;
    return await loadAndProcessCSVData(datasetPath, xColumns, yColumns);
  }

  if (isImage(params)) {
    const {
      trainingOptions: { width, height, channel, normalize },
    } = params;
    return await loadAndProcessImageData(params.datasetPath, width, height, channel, normalize);
  }

  throw new Error('Invalid Data type');
};

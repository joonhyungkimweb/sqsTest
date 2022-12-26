import './utils/env';
import { TfjsParametersWithDataType, TfjsRequestParameters } from './@types/TrainingParams';
import { trainCSVModel } from './Modules/CSVTrainer';
import { trainImageModel } from './Modules/ImageTrainer';
import { errorOnTrainingSession, startTrainingSession } from './Modules/APICalls';

const train = async () => {
  const params = JSON.parse(process.env.PARAMS as string) as TfjsRequestParameters;
  try {
    if (params.platform === 'tfjs') {
      if (params.dataType == null || (params.dataType !== 'TEXT' && params.dataType !== 'IMAGE'))
        throw new Error('Invalid Data type');

      await startTrainingSession(params.trainingId);

      if (params.dataType === 'TEXT')
        await trainCSVModel(params as TfjsParametersWithDataType<'TEXT'>);
      if (params.dataType === 'IMAGE')
        await trainImageModel(params as TfjsParametersWithDataType<'IMAGE'>);
      return;
    }
  } catch (error) {
    console.error(error);
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    await errorOnTrainingSession(params.trainingId, message);
  }
};

train();

import './utils/env';
import { TfjsParametersWithDataType, TfjsRequestParameters } from './@types/TrainingParams';
import { trainCSVModel } from './Modules/CSVTrainer';
import { trainImageModel } from './Modules/ImageTrainer';
import { createTrainingSession, startTrainingSession } from './Modules/APICalls';

const train = async () => {
  try {
    const params = JSON.parse(process.env.PARAMS as string) as TfjsRequestParameters;
    if (params.platform === 'tfjs') {
      if (params.dataType == null || (params.dataType !== 'TEXT' && params.dataType !== 'IMAGE'))
        throw new Error('Invalid Data type');

      const {
        data: { id: trainingId },
      } = await createTrainingSession(params);

      await startTrainingSession(trainingId);

      if (params.dataType === 'TEXT')
        await trainCSVModel(trainingId, params as TfjsParametersWithDataType<'TEXT'>);
      if (params.dataType === 'IMAGE')
        await trainImageModel(trainingId, params as TfjsParametersWithDataType<'IMAGE'>);
      return;
    }
  } catch (err) {
    console.error(err);
  }
};

train();

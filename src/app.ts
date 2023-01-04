import { TfjsRequestParameters } from './@types/TrainingParams';
import { errorOnTrainingSession, startTrainingSession } from './Modules/APICalls';
import { preprocessDataset } from './Modules/DataPreprocessor';
import { trainModel } from './Modules/ModelTrainer';

const train = async () => {
  const params = JSON.parse(process.env.PARAMS as string) as TfjsRequestParameters;
  try {
    if (params.platform === 'tfjs') {
      await startTrainingSession(params.trainingId);
      await trainModel(params, await preprocessDataset(params));
    }
  } catch (error) {
    console.error(error);
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    await errorOnTrainingSession(params.trainingId, message);
  }
};

train();

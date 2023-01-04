import { getTrainingStatus } from './APICalls';

export const startStatusChecker = (
  trainingId: number,
  intervalStopper: (trainingStatus: string) => boolean
) => {
  const interval = setInterval(async () => {
    const training = await getTrainingStatus(trainingId);
    if (intervalStopper(training)) clearInterval(interval);
  }, 1000);
};

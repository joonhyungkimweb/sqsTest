import fetch from 'cross-fetch';
import { TrainingEpochParameters } from '../@types/TrainingParams';

const TRAINING_ENDPOINT = `${process.env.API_ENDPOINT}/trainingstatus`;
const STATUS_ENDPOINT = `${TRAINING_ENDPOINT}/status`;
const EPOCH_ENDPOINT = `${TRAINING_ENDPOINT}/epoch`;

const fetchWithErrorHandler = async <Data = any>(
  url: string,
  options?: RequestInit
): Promise<Data> => {
  const request = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!request.ok) throw new Error(await request.text());
  return request.json();
};

const updateTrainingStatus = async (
  trainingId: number,
  status: 'start' | 'preprocessing' | 'training' | 'finish' | 'error',
  options?: {
    datasetId?: number;
    errorMessages?: string;
  }
) =>
  fetchWithErrorHandler(`${STATUS_ENDPOINT}/${trainingId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, ...options }),
  });

export const startTrainingSession = (trainingId: number) =>
  updateTrainingStatus(trainingId, 'start');

export const startPreprocessing = async (trainingId: number) =>
  updateTrainingStatus(trainingId, 'preprocessing');

export const startTrainningProcess = (trainingId: number) =>
  updateTrainingStatus(trainingId, 'training');

export const finishTrainingSession = (trainingId: number) =>
  updateTrainingStatus(trainingId, 'finish');

export const errorOnTrainingSession = (trainingId: number, errorMessages: string) =>
  updateTrainingStatus(trainingId, 'error', { errorMessages });

export const updateEpochResult = async (trainingId: number, epochParams: TrainingEpochParameters) =>
  fetchWithErrorHandler(`${EPOCH_ENDPOINT}/${trainingId}`, {
    method: 'PUT',
    body: JSON.stringify(epochParams),
  });

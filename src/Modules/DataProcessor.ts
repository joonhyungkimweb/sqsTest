import { parseCsvData, UnheadedCSV } from './CSVPaser';
import { getObject } from './Storage';
import { tensor, util } from '@tensorflow/tfjs-node-gpu';
import { streamToJSONObject } from './streamConverter';
import { Readable } from 'stream';
import { CSVMetaData } from '../@types/TrainingParams';

const loadCSVDataset = async (datasetURL: string) => {
  const {
    data: [, ...data],
  } = await parseCsvData((await getObject(datasetURL)).Body as NodeJS.ReadableStream);
  return data;
};
const isSelectedColumn = (columns: number[], index: number) => columns.includes(index);

const extractColumns = (dataSet: UnheadedCSV[], columns: number[]) =>
  dataSet.map((data) => data.filter((_, index) => isSelectedColumn(columns, index)));

export const loadAndProcessCSVData = async (
  metaDataURL: string,
  xColumns: number[],
  yColumns: number[]
) => {
  const { Body: metaDataBody } = await getObject(metaDataURL);
  const {
    fileData: { filepath },
  } = (await streamToJSONObject(metaDataBody as Readable)) as CSVMetaData;
  const data = await loadCSVDataset(filepath);
  util.shuffle(data);
  const xsArray = extractColumns(data, xColumns);
  const ysArray = extractColumns(data, yColumns);
  return {
    xs: tensor(xsArray),
    ys: tensor(ysArray),
  };
};

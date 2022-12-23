import { getObject } from './Storage';
import {
  tensor,
  tidy,
  node,
  image,
  Tensor4D,
  stack,
  util,
  dispose,
} from '@tensorflow/tfjs-node-gpu';
import { Readable } from 'stream';
import { streamToBuffer, streamToJSONObject } from './streamConverter';
import { ImageMetadata } from '../@types/TrainingParams';

const loadImageList = async (imageListURL: string): Promise<ImageMetadata> => {
  const { Body } = await getObject(imageListURL);
  return streamToJSONObject(Body as Readable);
};

const loadImageFile = async (imageURL: string) => {
  const { Body } = await getObject(imageURL.split('/').slice(3).join('/'));
  return streamToBuffer(Body as Readable);
};

const convertCanvasToTensor = (
  content: Buffer,
  width: number,
  height: number,
  channel: number,
  normalize: boolean
) =>
  tidy(() => {
    const imageTensor = node.decodeImage(content, channel);
    return image
      .cropAndResize(
        imageTensor.reshape<Tensor4D>([1, ...imageTensor.shape]),
        [[0, 0, 1, 1]],
        [0],
        [height, width]
      )
      .cast('int32')
      .reshape([height, width, channel])
      .div(normalize ? 255 : 1);
  });

const makeOnehotLabels = (classNames: (string | number)[]) => {
  const uniqueValues = Array.from(new Set(classNames)).sort();

  return classNames.map((value) => uniqueValues.map((e) => +(value === e)));
};

export const loadAndProcessImageData = async (
  datasetURL: string,
  width: number,
  height: number,
  channel: number,
  normalize: boolean
) => {
  const imageList = await loadImageList(datasetURL);
  util.shuffle(imageList);

  const loadedImages = await Promise.all(
    imageList.map(async ({ URL }) =>
      convertCanvasToTensor(await loadImageFile(URL), width, height, channel, normalize)
    )
  );

  const xs = stack(loadedImages);
  dispose(loadedImages);

  const ys = tensor(makeOnehotLabels(imageList.map(({ className }) => className)));
  return {
    xs,
    ys,
  };
};

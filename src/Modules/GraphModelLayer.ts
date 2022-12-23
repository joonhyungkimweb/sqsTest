import { GraphModel, layers, loadGraphModel, Tensor, zeros } from '@tensorflow/tfjs-node-gpu';

export const graphModelLayerFactory = async (
  model_name: string,
  model_url: string,
  from_tfhub?: boolean
) => {
  const graphModel = await loadGraphModel(model_url, { fromTFHub: !!from_tfhub });
  class GraphModelLayer extends layers.Layer {
    model: GraphModel;
    model_url: string;
    from_tfhub: boolean;
    constructor() {
      super({ trainable: false });
      this.model = graphModel;
      this.model_url = model_url;
      this.from_tfhub = !!from_tfhub;
    }
    call(inputs: Tensor | Tensor[]) {
      return this.model.predict(inputs) as Tensor | Tensor[];
    }

    getConfig() {
      return {
        ...super.getConfig(),
        model_url: this.model_url,
        fromTfhub: this.from_tfhub,
        model_name,
      };
    }

    computeOutputShape() {
      const predictResult = this.model.predict(
        this.model.inputs.map(({ shape }) => zeros(shape!.map((num) => Math.max(1, num))))
      ) as Tensor;
      return [null, ...predictResult.shape.slice(1)];
    }

    static get className() {
      return `GraphModel-${model_name.toLowerCase()}`;
    }
  }
  return GraphModelLayer;
};

export const graphModelLayer = async (modelName: string, modelURL: string, fromTFHub?: boolean) => {
  const GraphModelLayer = await graphModelLayerFactory(modelName, modelURL, fromTFHub);
  return new GraphModelLayer();
};

import * as tf from "@tensorflow/tfjs-node";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { readImage } from "../utils/imageUtils";
import path from "path";

export const filePath = path.resolve(__filename);

export default async function detectImage(imagePath: string) {
  const inputTensor = readImage(imagePath);
  const model = await cocoSsd.load();
  const predictions = await model.detect(inputTensor);
  tf.dispose(inputTensor);
  model.dispose();

  console.log("Predictions: ", predictions);

  return predictions;
}

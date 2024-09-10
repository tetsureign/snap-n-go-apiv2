import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Piscina from "piscina";
import * as detectWorker from "./detectWorker";

const piscina = new Piscina({
  filename: detectWorker.filePath,
});

export async function runDetection(imagePath: string) {
  try {
    const predictions: cocoSsd.DetectedObject[] = await piscina.run(imagePath);
    return predictions;
  } catch (error: any) {
    console.error(error);
  }
}

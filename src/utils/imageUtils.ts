import * as tf from "@tensorflow/tfjs-node";
import * as fs from "fs";

export function readImage(path: string) {
  const imageBuffer = fs.readFileSync(path);
  // This will always export as Tensor3D
  const tfImage = tf.node.decodeImage(imageBuffer, 0, "int32", false);
  return tfImage as tf.Tensor3D;
}

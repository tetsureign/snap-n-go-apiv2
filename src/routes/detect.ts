import express, { Request, Response } from "express";
import * as tf from "@tensorflow/tfjs-node";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as fs from "fs";
import { UploadToTemp } from "../utils/upload";

const router = express.Router();

function readImageDisk(path: string) {
  const imageBuffer = fs.readFileSync(path);
  const tfimage = tf.node.decodeImage(imageBuffer);
  return tfimage as tf.Tensor3D;
}

async function detectImage(input: tf.Tensor3D) {
  const model = await cocoSsd.load();
  const predictions = await model.detect(input);

  console.log("Predictions: ", predictions);

  return predictions;
}

router.post(
  "/",
  UploadToTemp.single("image"),
  async (req: Request, res: Response) => {
    const filePath = req.file?.path;

    if (filePath) {
      const inputTensor = readImageDisk(filePath);
      const predictions = await detectImage(inputTensor);

      // Delete the file right after finish processing
      fs.unlink(filePath, (err) => {
        err && console.error("Failed to delete file.");
      });

      res.json({ success: true, predictions });
    } else throw new Error("No file uploaded.");
  }
);

export default router;

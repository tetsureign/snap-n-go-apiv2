import yoloApiClient from "@/utils/yoloApiClient";
import fs from "fs";
import FormData from "form-data";

import { pathChecking } from "@/utils/pathChecking";

interface DetectionResult {
  object: string;
  score: number;
  coordinate: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export const sendImageToYolo = async (imagePath: string) => {
  try {
    const normalizedPath = pathChecking(imagePath);

    const formData = new FormData();
    const imageBuffer = fs.readFileSync(normalizedPath);
    formData.append("file", imageBuffer, {
      filename: "image",
      contentType: "image/*",
    });

    const response = await yoloApiClient.post("/images/detect", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const detectionResult: DetectionResult[] = response.data;

    return detectionResult;
  } catch (error) {
    throw new Error("Error sending image to microservice: " + error);
  }
};

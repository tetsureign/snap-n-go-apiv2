import FormData from "form-data";
import fs from "fs";
import { z } from "zod/v4";

import detectionSchemas from "@/schemas/detectionSchemas";
import { pathChecking } from "@/utils/pathChecking";
import yoloApiClient from "@/utils/yoloApiClient";

type DetectionResult = z.infer<typeof detectionSchemas.detectionResult>;

async function sendImageToYolo(imagePath: string) {
  try {
    const normalizedPath = pathChecking(imagePath);

    const formData = new FormData();
    const imageBuffer = await fs.promises.readFile(normalizedPath);
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
}

const detectionService = {
  sendImageToYolo,
};

export default detectionService;

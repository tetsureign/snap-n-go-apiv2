import FormData from "form-data";
import fs from "fs";
import { z } from "zod/v4";

import { detectionResult } from "@/types/detectionSchemas";
import { pathChecking } from "@/utils/pathChecking";
import yoloApiClient from "@/utils/yoloApiClient";

type DetectionResult = z.infer<typeof detectionResult>;

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

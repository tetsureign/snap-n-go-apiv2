import apiClient from "./yoloApiClient";
import fs from "fs";
import FormData from "form-data";

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
    const formData = new FormData();
    const imageBuffer = fs.readFileSync(imagePath);
    formData.append("file", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    const response = await apiClient.post("/images/detect", formData, {
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

import apiClient from "./yoloApiClient";
import fs from "fs";
import FormData from "form-data";

export const sendImageToYolo = async (imagePath: string) => {
  try {
    const formData = new FormData();
    const imageBuffer = fs.readFileSync(imagePath);
    formData.append("file", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    const response = await apiClient.post("/detect", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Error processing image: " + error);
  }
};

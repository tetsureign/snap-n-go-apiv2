import FormData from "form-data";

import { ExternalServiceError } from "@/shared/errors/appError";
import {
  DetectionImage,
  DetectionTransport,
} from "@/modules/detection/detection.types";
import yoloApiClient from "@/modules/detection/yoloApiClient";

class HttpDetectionTransport implements DetectionTransport {
  async detectImage(image: DetectionImage) {
    try {
      const formData = new FormData();
      formData.append("file", image.buffer, {
        filename: image.filename,
        contentType: image.mimeType,
      });

      const response = await yoloApiClient.post("/images/detect", formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      return response.data;
    } catch {
      throw new ExternalServiceError("Error sending image to detection service");
    }
  }
}

const httpDetectionTransport = new HttpDetectionTransport();

export default httpDetectionTransport;

import httpDetectionTransport from "@/modules/detection/httpDetectionTransport";
import { DetectionImage } from "@/modules/detection/detection.types";

async function detectImage(image: DetectionImage) {
  return httpDetectionTransport.detectImage(image);
}

const detectionService = {
  detectImage,
};

export default detectionService;

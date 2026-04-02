import httpDetectionTransport from "@/transports/httpDetectionTransport";
import { DetectionImage } from "@/types/detection";

async function detectImage(image: DetectionImage) {
  return httpDetectionTransport.detectImage(image);
}

const detectionService = {
  detectImage,
};

export default detectionService;

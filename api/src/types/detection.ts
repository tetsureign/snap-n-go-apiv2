import { z } from "zod";

import detectionSchemas from "@/schemas/detectionSchemas";

export type DetectionResult = z.infer<typeof detectionSchemas.detectionResult>;

export type DetectionImage = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

export interface DetectionTransport {
  detectImage(image: DetectionImage): Promise<DetectionResult[]>;
}

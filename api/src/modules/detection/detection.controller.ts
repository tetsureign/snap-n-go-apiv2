import { FastifyReply, FastifyRequest } from "fastify";

import { BadRequestError } from "@/shared/errors/appError";
import { sendOkList } from "@/shared/http/responses";
import detectionService from "@/modules/detection/detection.service";

import detectionSchemas from "@/modules/detection/detection.schemas";

import {
  assertValidImageBuffer,
  isImageFile,
} from "@/modules/detection/fileValidation";

export const handleDetection = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const data = await req.file({
    limits: {
      files: 1,
      fields: 0,
      parts: 1,
    },
  });
  if (!data) {
    throw new BadRequestError("No file uploaded");
  }

  if (!isImageFile(data.mimetype)) {
    throw new BadRequestError("Only image files are allowed");
  }

  const imageBuffer = await data.toBuffer();

  try {
    await assertValidImageBuffer(imageBuffer);
  } catch (error) {
    throw new BadRequestError((error as Error).message);
  }

  const detectionResult = await detectionService.detectImage({
    buffer: imageBuffer,
    filename: data.filename || "image",
    mimeType: data.mimetype || "application/octet-stream",
  });

  return sendOkList(reply, detectionSchemas.detectionResult, detectionResult);
};

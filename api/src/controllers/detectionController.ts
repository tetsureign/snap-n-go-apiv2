import { FastifyReply, FastifyRequest } from "fastify";

import { BadRequestError } from "@/errors/appError";
import { sendOkList } from "@/http/responses";
import detectionService from "@/services/detectionService";

import detectionSchemas from "@/schemas/detectionSchemas";

import { assertValidImageBuffer, isImageFile } from "@/utils/fileValidation";

export const handleDetection = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const data = await req.file();
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

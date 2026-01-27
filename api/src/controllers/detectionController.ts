import { FastifyReply, FastifyRequest } from "fastify";

import detectionService from "@/services/detectionService";

import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";
import detectionSchemas from "@/schemas/detectionSchemas";

import { pathChecking } from "@/utils/pathChecking";
import { isImageFile } from "@/utils/fileValidation";
import { generateUniqueFilename } from "@/utils/filenameGenerator";
import { saveFileToTemp, deleteFile } from "@/utils/fileStorage";

export const handleDetection = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  // Fastify multipart: req.file() returns a promise with the file stream
  const data = await req.file();
  if (!data) {
    return reply
      .status(400)
      .send(
        zodResponseSchemas.badRequest.parse({ message: "No file uploaded" })
      );
  }

  // Validate that the file is an image
  if (!isImageFile(data.mimetype)) {
    return reply.status(400).send(
      zodResponseSchemas.badRequest.parse({
        message: "Only image files are allowed",
      })
    );
  }

  // Generate unique filename and save file to disk
  const uniqueFilename = generateUniqueFilename(data.filename);
  const tempPath = await saveFileToTemp(data.file, uniqueFilename);

  try {
    const normalizedPath = pathChecking(tempPath);
    const detectionResult = await detectionService.sendImageToYolo(
      normalizedPath
    );

    reply.send(
      zodResponseSchemas
        .ok(detectionSchemas.detectionResult)
        .parse({ data: detectionResult })
    );

    deleteFile(normalizedPath, (err) => {
      req.log.error(err, "Failed to delete file.");
    });
  } catch (error) {
    req.log.error(error, "Error handling detection.");
    try {
      const safePathToDel = pathChecking(tempPath);
      deleteFile(safePathToDel, (err) => {
        req.log.error(err, "Failed to delete file.");
      });
    } catch (deleteError) {
      req.log.error(deleteError, "Failed to validate path for deletion.");
    }
    reply.status(500).send(zodResponseSchemas.internalError.parse({}));
  }
};

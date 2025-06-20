import { FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import { sendImageToYolo } from "@/services/yoloService";
import { pathChecking } from "@/utils/pathChecking";

export const handleDetection = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  // Fastify multipart: req.file() returns a promise with the file stream
  const data = await req.file();
  if (!data) {
    return reply
      .status(400)
      .send({ success: false, message: "No file uploaded" });
  }

  // Save file to disk
  const tempPath = `/tmp/${Date.now()}-${data.filename}`;
  const writeStream = fs.createWriteStream(tempPath);
  await new Promise((resolve, reject) => {
    data.file.pipe(writeStream);
    data.file.on("end", resolve);
    data.file.on("error", reject);
  });

  try {
    const normalizedPath = pathChecking(tempPath);
    const detectionResult = await sendImageToYolo(normalizedPath);

    reply.send({ success: true, data: detectionResult });

    fs.unlink(normalizedPath, (err) => {
      err && req.log.error(err, "Failed to delete file.");
    });
  } catch (error) {
    req.log.error(error, "Error handling detection.");
    try {
      const safePathToDel = pathChecking(tempPath);
      fs.unlink(safePathToDel, (err) => {
        err && req.log.error(error, "Failed to delete file.");
      });
    } catch (deleteError) {
      req.log.error(deleteError, "Failed to validate path for deletion.");
    }
    reply
      .status(500)
      .send({ success: false, message: (error as Error).message });
  }
};

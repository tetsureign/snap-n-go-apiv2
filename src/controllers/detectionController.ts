import { Request, Response } from "express";
import fs from "fs";

import { sendImageToYolo } from "@/services/yoloSvc";
import { pathChecking } from "@/utils/pathChecking";
import logger from "@/utils/logger";

export const handleDetection = async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (filePath) {
    try {
      const normalizedPath = pathChecking(filePath);

      const detectionResult = await sendImageToYolo(normalizedPath);

      res.json({ success: true, data: detectionResult });

      fs.unlink(normalizedPath, (err) => {
        err && logger.error(err, "Failed to delete file.");
      });
    } catch (error) {
      logger.error(error, "Error handling detection.");

      try {
        const safePathToDel = pathChecking(filePath);
        fs.unlink(safePathToDel, (err) => {
          err && logger.error(error, "Failed to delete file.");
        });
      } catch (deleteError) {
        logger.error(deleteError, "Failed to validate path for deletion.");
      }

      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
};

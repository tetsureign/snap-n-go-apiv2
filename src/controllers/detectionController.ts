import { Request, Response } from "express";
import fs from "fs";
import { AxiosError } from "axios";

import { sendImageToYolo } from "@/services/yoloSvc";

export const handleDetection = async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (filePath) {
    try {
      const detectionResult = await sendImageToYolo(filePath);
      res.json({ success: true, data: detectionResult });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as AxiosError).message });
    }

    fs.unlink(filePath, (err) => {
      err && console.error("Failed to delete file.");
    });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
};

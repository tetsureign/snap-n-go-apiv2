import express, { Request, Response } from "express";
import * as fs from "fs";
import { UploadToTemp } from "../utils/uploadUtils";
import { runDetection } from "../services/detectSvc";

const router = express.Router();

router.post(
  "/",
  UploadToTemp.single("image"),
  async (req: Request, res: Response) => {
    const filePath = req.file?.path;

    if (filePath) {
      const data = await runDetection(filePath);

      // Delete the file right after finish processing
      fs.unlink(filePath, (err) => {
        err && console.error("Failed to delete file.");
      });

      // res.json({ status: 201, data });
      res.send(data);
    } else throw new Error("No file uploaded.");
  }
);

export default router;

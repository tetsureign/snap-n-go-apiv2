import { Request, Response } from "express";
import fs from "fs";

export const handleDetection = async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (filePath) {
    // TODO: Fetch from yolo microservice
    const data = -1;

    // Delete the file right after finish processing
    fs.unlink(filePath, (err) => {
      err && console.error("Failed to delete file.");
    });

    // res.json({ status: 201, data });
    res.send(data);
  } else {
    throw new Error("No file uploaded.");
  }
};

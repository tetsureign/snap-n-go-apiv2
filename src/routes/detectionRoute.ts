import express, { Request, Response } from "express";
import * as fs from "fs";
import { handleDetection } from "src/controllers/detectionController";
import { UploadToTemp } from "../utils/uploadUtils";

const router = express.Router();

router.post("/", UploadToTemp.single("image"), handleDetection);

export default router;

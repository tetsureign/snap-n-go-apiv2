import express from "express";

import { handleDetection } from "@/controllers/detectionController";
import { UploadToTemp } from "@/utils/uploadUtils";

const detectRouter = express.Router();

detectRouter.post("/", UploadToTemp.single("image"), handleDetection);

export default detectRouter;

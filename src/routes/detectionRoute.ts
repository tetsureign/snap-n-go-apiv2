import express from "express";
import { handleDetection } from "../controllers/detectionController";
import { UploadToTemp } from "../utils/uploadUtils";

const router = express.Router();

router.post("/", UploadToTemp.single("image"), handleDetection);

export default router;

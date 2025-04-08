import { Request, Response, NextFunction } from "express";
import logger from "@/utils/logger";

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`Error on ${req.method} ${req.url}: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
}

export default errorHandler;

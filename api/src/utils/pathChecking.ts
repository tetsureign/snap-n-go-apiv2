import path from "path";
import fs from "fs";
import { env } from "@/config/env";

export const pathChecking = (filePath: string) => {
  if (!filePath) throw new Error("File path is required.");
  const resolvedPath = path.resolve(path.normalize(filePath));

  if (!resolvedPath.startsWith(env.uploadTempDir))
    throw new Error("Path outside allowed directory.");

  try {
    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile())
      throw new Error("Invalid file path: Not a regular file");
  } catch (error) {
    throw new Error(`Invalid file path: ${error}`);
  }

  return resolvedPath;
};

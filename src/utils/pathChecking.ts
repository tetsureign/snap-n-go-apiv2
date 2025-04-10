import path from "path";
import fs from "fs";

export const pathChecking = (filePath: string) => {
  if (!filePath) throw new Error("File path is required.");

  const UPLOAD_TEMP_DIR = process.env.UPLOAD_TEMP_DIR || "/tmp";

  const resolvedPath = path.resolve(path.normalize(filePath));

  if (!resolvedPath.startsWith(UPLOAD_TEMP_DIR))
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

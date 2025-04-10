import path from "path";

export const pathChecking = (filePath: string) => {
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(process.env.UPLOAD_TEMP_DIR || "/tmp"))
    throw new Error("Invalid file path.");

  return normalizedPath;
};

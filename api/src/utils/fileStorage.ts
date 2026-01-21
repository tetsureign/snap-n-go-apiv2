import fs from "fs";
import path from "path";
import { Readable } from "stream";

/**
 * Saves a file stream to disk in the temporary upload directory
 * @param fileStream - The file stream to save
 * @param filename - The filename to use
 * @returns The full path where the file was saved
 */
export const saveFileToTemp = async (
  fileStream: Readable,
  filename: string
): Promise<string> => {
  const uploadDir = process.env.UPLOAD_TEMP_DIR || "/tmp";
  const filePath = path.join(uploadDir, filename);

  const writeStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    fileStream.pipe(writeStream);
    fileStream.on("end", () => resolve(filePath));
    fileStream.on("error", reject);
    writeStream.on("error", reject);
  });
};

/**
 * Deletes a file from disk
 * @param filePath - The path of the file to delete
 * @param logger - Optional logger function for error logging
 */
export const deleteFile = (
  filePath: string,
  logger?: (error: Error) => void
): void => {
  fs.unlink(filePath, (err) => {
    if (err && logger) {
      logger(err as Error);
    }
  });
};

